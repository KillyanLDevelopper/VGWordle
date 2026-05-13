import { GuessState } from './game.js';

const DEFAULT_LAYOUT = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
	['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const VALID_KEY_STATES = new Set(Object.values(GuessState));
const KEY_STATE_PRIORITY = {
	[GuessState.ABSENT]: 0,
	[GuessState.PRESENT]: 1,
	[GuessState.CORRECT]: 2
};

function getKeyboardElement(selector = '#clavier') {
	return document.querySelector(selector);
}

function getKeyElement(key, keyboardSelector = '#clavier') {
	const keyboardElement = getKeyboardElement(keyboardSelector);

	if (!keyboardElement) {
		return null;
	}

	return keyboardElement.querySelector(`.keyboard-key[data-key="${key}"]`);
}

function normalizeLetter(value) {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim().toUpperCase();
}

export function createKeyboard(options = {}) {
	const {
		keyboardSelector = '#clavier',
		layout = DEFAULT_LAYOUT,
		enterLabel = 'Entrer',
		backspaceLabel = 'Effacer'
	} = options;

	const keyboardElement = getKeyboardElement(keyboardSelector);

	if (!keyboardElement) {
		throw new Error(`Keyboard container not found: ${keyboardSelector}`);
	}

	keyboardElement.innerHTML = '';

	const fragment = document.createDocumentFragment();

	for (let rowIndex = 0; rowIndex < layout.length; rowIndex += 1) {
		const row = layout[rowIndex];
		const rowElement = document.createElement('div');
		rowElement.className = 'keyboard-row';
		rowElement.dataset.row = String(rowIndex);

		for (let keyIndex = 0; keyIndex < row.length; keyIndex += 1) {
			const key = row[keyIndex];
			const keyElement = document.createElement('button');
			keyElement.type = 'button';
			keyElement.className = 'keyboard-key';
			keyElement.dataset.key = key;

			if (key === 'ENTER') {
				keyElement.classList.add('keyboard-key--action');
				keyElement.textContent = enterLabel;
			} else if (key === 'BACKSPACE') {
				keyElement.classList.add('keyboard-key--action');
				keyElement.textContent = backspaceLabel;
			} else {
				keyElement.textContent = key;
			}

			rowElement.appendChild(keyElement);
		}

		fragment.appendChild(rowElement);
	}

	keyboardElement.appendChild(fragment);
	return keyboardElement;
}

export function setKeyState(key, keyState, keyboardSelector = '#clavier') {
	if (!VALID_KEY_STATES.has(keyState)) {
		return null;
	}

	const normalizedKey = normalizeLetter(key);

	if (!normalizedKey) {
		return null;
	}

	const keyElement = getKeyElement(normalizedKey, keyboardSelector);

	if (!keyElement) {
		return null;
	}

	const currentState = keyElement.dataset.state;
	const currentPriority = KEY_STATE_PRIORITY[currentState] ?? -1;
	const nextPriority = KEY_STATE_PRIORITY[keyState];

	if (nextPriority < currentPriority) {
		return keyElement;
	}

	keyElement.classList.remove('keyboard-key--correct', 'keyboard-key--present', 'keyboard-key--absent');
	keyElement.classList.add(`keyboard-key--${keyState}`);
	keyElement.dataset.state = keyState;

	return keyElement;
}

export function updateKeyboardStates(lettersState, keyboardSelector = '#clavier') {
	if (!lettersState || typeof lettersState !== 'object') {
		return [];
	}

	const updatedKeys = [];
	const entries = Object.entries(lettersState);

	for (let index = 0; index < entries.length; index += 1) {
		const [letter, state] = entries[index];
		const keyElement = setKeyState(letter, state, keyboardSelector);

		if (keyElement) {
			updatedKeys.push(keyElement);
		}
	}

	return updatedKeys;
}

export function listenVirtualKeyboard(handlers = {}, keyboardSelector = '#clavier') {
	const keyboardElement = getKeyboardElement(keyboardSelector);

	if (!keyboardElement) {
		throw new Error(`Keyboard container not found: ${keyboardSelector}`);
	}

	const {
		onLetter = () => {},
		onEnter = () => {},
		onDelete = () => {}
	} = handlers;

	const onClick = (event) => {
		const keyElement = event.target.closest('.keyboard-key');

		if (!keyElement || !keyboardElement.contains(keyElement)) {
			return;
		}

		const key = keyElement.dataset.key;

		if (key === 'ENTER') {
			onEnter();
			return;
		}

		if (key === 'BACKSPACE') {
			onDelete();
			return;
		}

		onLetter(key);
	};

	keyboardElement.addEventListener('click', onClick);

	return () => {
		keyboardElement.removeEventListener('click', onClick);
	};
}

export function listenPhysicalKeyboard(handlers = {}) {
	const {
		onLetter = () => {},
		onEnter = () => {},
		onDelete = () => {}
	} = handlers;

	const onKeyDown = (event) => {
		const key = event.key;

		if (key === 'Enter') {
			event.preventDefault();
			onEnter();
			return;
		}

		if (key === 'Backspace') {
			event.preventDefault();
			onDelete();
			return;
		}

		if (/^[a-zA-Z]$/.test(key)) {
			event.preventDefault();
			onLetter(key.toUpperCase());
		}
	};

	document.addEventListener('keydown', onKeyDown);

	return () => {
		document.removeEventListener('keydown', onKeyDown);
	};
}
