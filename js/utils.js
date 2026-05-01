export function getRandomWord(words) {
	if (!Array.isArray(words) || words.length === 0) {
		return null;
	}

	const randomIndex = Math.floor(Math.random() * words.length);
	return words[randomIndex];
}

export function getWordOfTheDay(words) {
	if (!Array.isArray(words) || words.length === 0) {
		return null;
	}

	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const day = today.getDate();
	const seed = year * 10000 + month * 100 + day;

	const index = seed % words.length;
	return words[index];
}

export function isValidWord(word, validList) {
	if (typeof word !== 'string' || !Array.isArray(validList)) {
		return false;
	}

	const normalizedWord = word.trim().toUpperCase();
	return validList.includes(normalizedWord);
}

export function normalizeWord(word) {
	if (typeof word !== 'string') {
		return '';
	}

	return word.trim().toUpperCase();
}
