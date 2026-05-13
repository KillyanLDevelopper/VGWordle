import { GameState, initGame, addLetter, deleteLetter, submitGuess } from './game.js';
import { createBoard, setCellLetter, updateValidatedRow } from './board.js';
import { createKeyboard, listenVirtualKeyboard, listenPhysicalKeyboard, updateKeyboardStates } from './keyboard.js';
import { WORD_LIST } from './words.js';
import { getWordOfTheDay, isValidWord } from './utils.js';

let gameState = null;
const validWordList = WORD_LIST;
let unlistenVirtual = null;
let unlistenPhysical = null;

function displayCurrentGuess() {
	if (!gameState) {
		return;
	}

	const { currentGuess, currentRow } = gameState;

	for (let colIndex = 0; colIndex < currentGuess.length; colIndex += 1) {
		setCellLetter(currentRow, colIndex, currentGuess[colIndex]);
	}

	for (let colIndex = currentGuess.length; colIndex < 5; colIndex += 1) {
		setCellLetter(currentRow, colIndex, '');
	}
}

function displayPreviousAttempts() {
	if (!gameState) {
		return;
	}

	const { attempts } = gameState;

	for (let rowIndex = 0; rowIndex < attempts.length; rowIndex += 1) {
		const { word, evaluation } = attempts[rowIndex];
		updateValidatedRow(rowIndex, word, evaluation);
	}
}

function handleLetterInput(letter) {
	if (!gameState) {
		return;
	}

	gameState = addLetter(gameState, letter);
	displayCurrentGuess();
}

function handleDelete() {
	if (!gameState) {
		return;
	}

	gameState = deleteLetter(gameState);
	displayCurrentGuess();
}

function handleSubmit() {
	if (!gameState || gameState.gameState !== GameState.PLAYING) {
		return;
	}

	const guess = gameState.currentGuess.trim().toUpperCase();

	if (guess.length !== gameState.wordLength) {
		console.warn('Mot incomplet');
		return;
	}

	if (!isValidWord(guess, validWordList)) {
		console.warn('Mot non reconnu');
		return;
	}

	const previousState = gameState;
	gameState = submitGuess(gameState);

	if (gameState === previousState) {
		return;
	}

	const rowIndex = previousState.currentRow;
	updateValidatedRow(rowIndex, previousState.currentGuess, previousState.attempts[rowIndex]?.evaluation);
	updateKeyboardStates(gameState.lettersState);

	if (gameState.gameState === GameState.WON) {
		console.log('🎉 Victoire!');
	} else if (gameState.gameState === GameState.LOST) {
		console.log('💀 Défaite');
		console.log(`Le mot était: ${gameState.targetWord}`);
	}
}

export function initApp() {
	try {
		const targetWord = getWordOfTheDay(WORD_LIST);

		if (!targetWord) {
			throw new Error('Impossible de charger un mot pour le jeu');
		}

		gameState = initGame({
			targetWord,
			wordLength: 5,
			maxAttempts: 6
		});

		createBoard();
		createKeyboard();

		displayPreviousAttempts();
		displayCurrentGuess();

		unlistenVirtual = listenVirtualKeyboard({
			onLetter: handleLetterInput,
			onDelete: handleDelete,
			onEnter: handleSubmit
		});

		unlistenPhysical = listenPhysicalKeyboard({
			onLetter: handleLetterInput,
			onDelete: handleDelete,
			onEnter: handleSubmit
		});

		console.log('✅ Jeu initialisé');
	} catch (error) {
		console.error('Erreur lors de l\'initialisation du jeu:', error);
	}
}

export function cleanupApp() {
	if (unlistenVirtual) {
		unlistenVirtual();
		unlistenVirtual = null;
	}

	if (unlistenPhysical) {
		unlistenPhysical();
		unlistenPhysical = null;
	}

	gameState = null;
}

document.addEventListener('DOMContentLoaded', initApp);
