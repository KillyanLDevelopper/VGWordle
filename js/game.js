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
