import { GuessState } from './game.js';

export function createBoard(options = {}) {
	const {
		rows = 6,
		cols = 5,
		boardSelector = '#grille'
	} = options;

	const boardElement = document.querySelector(boardSelector);

	if (!boardElement) {
		throw new Error(`Board container not found: ${boardSelector}`);
	}

	boardElement.innerHTML = '';

	const fragment = document.createDocumentFragment();

	for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
		const rowElement = document.createElement('div');
		rowElement.className = 'board-row';
		rowElement.dataset.row = String(rowIndex);

		for (let colIndex = 0; colIndex < cols; colIndex += 1) {
			const cellElement = document.createElement('div');
			cellElement.className = 'board-cell';
			cellElement.dataset.row = String(rowIndex);
			cellElement.dataset.col = String(colIndex);
			rowElement.appendChild(cellElement);
		}

		fragment.appendChild(rowElement);
	}

	boardElement.appendChild(fragment);
	return boardElement;
}

const VALID_CELL_STATES = new Set(Object.values(GuessState));

function getCell(rowIndex, colIndex, boardSelector = '#grille') {
	const boardElement = document.querySelector(boardSelector);

	if (!boardElement) {
		return null;
	}

	return boardElement.querySelector(`.board-cell[data-row="${rowIndex}"][data-col="${colIndex}"]`);
}

export function setCellLetter(rowIndex, colIndex, letter, boardSelector = '#grille') {
	const cellElement = getCell(rowIndex, colIndex, boardSelector);

	if (!cellElement) {
		return null;
	}

	const normalizedLetter = typeof letter === 'string' ? letter.trim().toUpperCase() : '';
	cellElement.textContent = normalizedLetter;
	return cellElement;
}

export function revealCellState(rowIndex, colIndex, cellState, boardSelector = '#grille') {
	const cellElement = getCell(rowIndex, colIndex, boardSelector);

	if (!cellElement) {
		return null;
	}

	cellElement.classList.remove('board-cell--correct', 'board-cell--present', 'board-cell--absent');

	if (VALID_CELL_STATES.has(cellState)) {
		cellElement.classList.add(`board-cell--${cellState}`);
		cellElement.dataset.state = cellState;
	} else {
		delete cellElement.dataset.state;
	}

	return cellElement;
}

export function updateValidatedRow(rowIndex, word, evaluation, boardSelector = '#grille') {
	if (typeof word !== 'string' || !Array.isArray(evaluation)) {
		return [];
	}

	const letters = word.toUpperCase().split('');
	const updatedCells = [];

	for (let colIndex = 0; colIndex < letters.length; colIndex += 1) {
		const cellElement = setCellLetter(rowIndex, colIndex, letters[colIndex], boardSelector);
		const revealedCell = revealCellState(rowIndex, colIndex, evaluation[colIndex], boardSelector);

		if (cellElement || revealedCell) {
			updatedCells.push(revealedCell || cellElement);
		}
	}

	return updatedCells;
}
