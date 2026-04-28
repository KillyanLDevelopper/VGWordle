export const GameState = Object.freeze({
	PLAYING: 'playing',
	WON: 'won',
	LOST: 'lost'
});

export function initGame(options = {}) {
	const {
		targetWord = '',
		wordLength = 5,
		maxAttempts = 6
	} = options;

	return {
		targetWord,
		wordLength,
		maxAttempts,
		attempts: [],
		currentGuess: '',
		currentRow: 0,
		gameState: GameState.PLAYING,
		lettersState: {}
	};
}

export function addLetter(state, letter) {
    if (state.gameState !== GameState.PLAYING) {
        return state;
    }

    if (typeof letter !== 'string') {
        return state;
    }

    const normalizedLetter = letter.trim().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

    if (normalizedLetter.length !== 1) {
        return state;
    }

    if (!/^[A-Z]$/.test(normalizedLetter)) return state;


    if (state.currentGuess.length >= state.wordLength) {
        return state;
    }

    return {
        ...state,
        currentGuess: state.currentGuess + normalizedLetter
    };
}

export function deleteLetter(state) {
    if (state.gameState !== GameState.PLAYING) {
        return state;
    }

    if (state.currentGuess.length === 0) {
        return state;
    }

    return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1)
    };
}

export const GuessState = Object.freeze({
    CORRECT: 'correct',
    PRESENT: 'present',
    ABSENT: 'absent'
});

function normalizeWord(word) {
    return String(word).trim().toUpperCase();
}

export function evaluateGuess(guess, targetWord) {
    const normalizedGuess = normalizeWord(guess);
    const normalizedTarget = normalizeWord(targetWord);
    const result = Array(normalizedGuess.length).fill(GuessState.ABSENT);
    const remainingLetters = normalizedTarget.split('');

    for (let index = 0; index < normalizedGuess.length; index += 1) {
        if (normalizedGuess[index] === normalizedTarget[index]) {
            result[index] = GuessState.CORRECT;
            remainingLetters[index] = null;
        }
    }

    for (let index = 0; index < normalizedGuess.length; index += 1) {
        if (result[index] === GuessState.CORRECT) {
            continue;
        }

        const letterIndex = remainingLetters.indexOf(normalizedGuess[index]);

        if (letterIndex !== -1) {
            result[index] = GuessState.PRESENT;
            remainingLetters[letterIndex] = null;
        }
    }

    return result;
}

function updateLettersState(previousLettersState, guess, evaluation) {
    const nextLettersState = { ...previousLettersState };
    const priority = {
        [GuessState.ABSENT]: 0,
        [GuessState.PRESENT]: 1,
        [GuessState.CORRECT]: 2
    };

    for (let index = 0; index < guess.length; index += 1) {
        const letter = guess[index];
        const nextState = evaluation[index];

        if (!nextLettersState[letter] || priority[nextState] > priority[nextLettersState[letter]]) {
            nextLettersState[letter] = nextState;
        }
    }

    return nextLettersState;
}

export function submitGuess(state) {
    if (state.gameState !== GameState.PLAYING) {
        return state;
    }

    const guess = normalizeWord(state.currentGuess);
    const targetWord = normalizeWord(state.targetWord);

    if (guess.length !== state.wordLength) {
        return state;
    }

    const evaluation = evaluateGuess(guess, targetWord);
    const nextAttempts = [
        ...state.attempts,
        {
            word: guess,
            evaluation
        }
    ];
    const nextLettersState = updateLettersState(state.lettersState, guess, evaluation);
    const nextRow = state.currentRow + 1;

    if (guess === targetWord) {
        return {
            ...state,
            attempts: nextAttempts,
            currentGuess: '',
            gameState: GameState.WON,
            lettersState: nextLettersState
        };
    }

    if (nextRow >= state.maxAttempts) {
        return {
            ...state,
            attempts: nextAttempts,
            currentGuess: '',
            currentRow: nextRow,
            gameState: GameState.LOST,
            lettersState: nextLettersState
        };
    }

    return {
        ...state,
        attempts: nextAttempts,
        currentGuess: '',
        currentRow: nextRow,
        lettersState: nextLettersState
    };
}

