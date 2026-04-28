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
