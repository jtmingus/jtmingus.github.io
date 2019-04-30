/** Settings */
const ROWS = 15;
const COLUMNS = 10;
const START_BLOCK_COUNT = 5;
const START_SPEED = 2; // Updates per second
const SPEED_CHANGE = 1;
const LEVEL_CHANGE_DELAY = 500;
const Direction = {
	LEFT: 0,
	RIGHT: 1,
};

/** Variables */
let grid;
let level;
let currRow;
let currStart;
let currEnd;
let currDirection;
let prevStart;
let prevEnd;
let speed;
let intervalId;
let blockSize;
let gridWidth;
let gridHeight;
let windowWidth;
let windowHeight;

/** Starts game and initializes variables. */
function startGame() {
	currRow = ROWS - 1;
	currStart = 0;
	currEnd = START_BLOCK_COUNT - 1;
	currDirection = Direction.RIGHT;
	prevStart = 0;
	prevEnd = 0;
	speed = START_SPEED;
	level = 0;
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	blockSize = calculateBlockSize();
	gridWidth = blockSize * COLUMNS;
	gridHeight = blockSize * ROWS;
	grid = initGrid();
	displayScore();
	
	play();
}

/** Calculates block size based on window size and expected aspect ratio. */
function calculateBlockSize() {
	const expectedAspectRatio = ROWS/COLUMNS;
	const availAspectRatio = windowHeight/windowWidth;
	
	let size;
	if (availAspectRatio >= expectedAspectRatio) {
		size = Math.floor((windowWidth) / COLUMNS);
	} else {
		size = Math.floor((windowHeight) / ROWS);
	}

	return size;
}

/** Initializes grid with initial block positions. */
function initGrid() {
	const gridEl = document.getElementsByClassName('grid')[0];
	const tbl = document.createElement('table');
	const tblBody = document.createElement('tbody');

	const g = [];
	for (let i = 0; i < ROWS; i++) {
		let r = [];
		let tblRow = document.createElement('tr');
		for (let j = 0; j < COLUMNS; j++) {
			const isBlock = (i === ROWS - 1 && j < START_BLOCK_COUNT) ? true : false;
			r.push(isBlock);

			const tblCell = document.createElement('td');
			tblCell.style.width = blockSize + 'px';
			tblCell.style.height = blockSize + 'px';
			tblCell.className = isBlock ? 'block' : 'empty';
			tblRow.appendChild(tblCell);
		}
		g.push(r);
		tblBody.appendChild(tblRow);
	}
	tbl.appendChild(tblBody);
	gridEl.appendChild(tbl);
	gridEl.style.width = gridWidth + 'px';
	gridEl.style.height = gridHeight + 'px';
	gridEl.style.marginTop = (windowHeight - gridHeight) / 2 + 'px';

	return g;
}

/** Updates block grid with new block positions. */
function updateBlocks() {
	// Moves current row of blocks.
	if (currDirection === Direction.RIGHT) {
		currStart += 1;
		currEnd += 1;
	} else {
		currStart -= 1;
		currEnd -= 1;
	}
	grid[currRow] = grid[currRow].map(function(value, index) {
		return currStart <= index && index <= currEnd;
	});

	// Updates table.
	const tblRows = document.getElementsByTagName('tr');
	for (let i = 0; i < ROWS; i++) {
		tblRow = tblRows[i];
		rowCells = tblRow.getElementsByTagName('td');
		for (let j = 0; j < COLUMNS; j++) {
			rowCells[j].className = grid[i][j] ? 'block' : 'empty';
		}
	}

	// Checks if we need to change direction.
	if (currEnd === COLUMNS - 1) {
		currDirection = Direction.LEFT;
	} else if (currStart === 0) {
		currDirection = Direction.RIGHT;
	}
}
/** Advances level if blocks are stacked, else ends the game. */
function onClick(e) {
	e.preventDefault();
	if (level === 0) {
		nextLevel(currStart, currEnd);
		return;
	}

	const maxStart = Math.max(currStart, prevStart);
	const minEnd = Math.min(currEnd, prevEnd);
	if (maxStart <= minEnd) {
		nextLevel(maxStart, minEnd);
	} else {
		endGame();
	}
}

/**
 * Moves valid blocks to the next level and sends updated score.
 * @param {number} newStart
 * @param {number} newEnd
 */
function nextLevel(newStart, newEnd) {
	pause();

	let lostBlocks = false;
	const tblRows = document.getElementsByTagName('tr');
	const cells = tblRows[currRow].getElementsByTagName('td');
	for (let i = 0; i < cells.length; i++) {
		if (currStart <= i && i <= currEnd) {
			const isStackable = newStart <= i && i <= newEnd;
			grid[currRow][i] = isStackable;
			cells[i].className = isStackable ? 'block' : 'lost';

			lostBlocks = lostBlocks || !isStackable;
		} else {
			grid[currRow][i] = false;
			cells[i].className = 'empty';
		}
	}

	prevStart = newStart;
	prevEnd = newEnd;
	currStart = newStart;
	currEnd = newEnd;
	currRow -= 1;
	level += 1;
	speed += SPEED_CHANGE;

	if (currRow <= 1) {
		currRow += 1;
		shiftGrid();
	}

	displayScore();
	window.postMessage(JSON.stringify({ score: level }), '*');

	setTimeout(play, LEVEL_CHANGE_DELAY);
}

/** Displays and styles current score */
function displayScore() {
	const scoreEl = document.getElementsByClassName('score')[0];
	// Multipliers size and position font
	scoreEl.style.fontSize = blockSize * 1.5 + 'px'; 
	scoreEl.style.padding = blockSize / 8 + 'px';
	scoreEl.innerHTML = level + '';
}

/** Shifts grid down one index. */
function shiftGrid() {
	for (let i = ROWS - 1; i >= 1; i--) {
		grid[i] = grid[i-1];
	}
}

/** Starts update loop and registers listeners. */
function play() {
	intervalId = setInterval(updateBlocks, 1000/speed);

	document.body.addEventListener('touchstart', onClick);
	document.body.addEventListener('mousedown', onClick);
}

/** Stops update loop and removes listeners. */
function pause() {
	clearInterval(intervalId);

	document.body.removeEventListener('touchstart', onClick);
	document.body.removeEventListener('mousedown', onClick);
}

/** Resets the game. */
function retry() {
	const retryButton = document.getElementsByClassName('retry')[0];
	retryButton.style.display = 'none';

	const table = document.getElementsByTagName('table')[0];
	table.parentNode.removeChild(table);

	startGame();
}

/** Ends the game and displays retry button. */
function endGame() {
	pause();

	const retryButton = document.getElementsByClassName('retry')[0];
	retryButton.style.display = 'block';
	retryButton.style.fontSize = blockSize / 2 + 'px';
}

