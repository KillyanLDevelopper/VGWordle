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
