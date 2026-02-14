class Game2048 {
    constructor() {
        this.size = 4;
        this.score = 0;
        this.best = Number(localStorage.getItem('best2048') || 0);
        this.nextId = 1;
        this.animationMs = 160;
        this.isAnimating = false;

        this.grid = [];
        this.tiles = new Map();

        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.gameMessage = document.getElementById('game-message');
        this.messageTitle = document.getElementById('message-title');
        this.messageText = document.getElementById('message-text');
        this.restartButton = document.getElementById('restart-button');
        this.newGameButton = document.getElementById('new-game-button');

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        this.tiles.clear();
        this.nextId = 1;
        this.score = 0;
        this.isAnimating = false;
        this.hideMessage();
        this.clearTiles();

        this.addRandomTile();
        this.addRandomTile();

        this.updateScore();
        this.renderTiles(true);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches.length || this.isAnimating) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) this.move('right');
                if (deltaX < -50) this.move('left');
            } else {
                if (deltaY > 50) this.move('down');
                if (deltaY < -50) this.move('up');
            }
        });

        this.restartButton.addEventListener('click', () => this.init());
        this.newGameButton.addEventListener('click', () => this.init());

        window.addEventListener('resize', () => this.renderTiles(true));
    }

    handleKeyPress(e) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        if (this.isAnimating) return;
        const direction = e.key.replace('Arrow', '').toLowerCase();
        this.move(direction);
    }

    getCellMetrics() {
        const firstCell = document.querySelector('.grid-cell');
        if (!firstCell) return { step: 116.25 };

        const cellSize = firstCell.getBoundingClientRect().width;
        const gap = Number.parseFloat(getComputedStyle(firstCell).marginRight) || 10;
        return { step: cellSize + gap };
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === null) empty.push([r, c]);
            }
        }
        if (!empty.length) return;

        const [row, col] = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        const tile = {
            id: this.nextId++,
            value,
            row,
            col,
            prevRow: row,
            prevCol: col,
            isNew: true,
            isMerged: false,
            removed: false,
            mergedThisTurn: false
        };
        this.tiles.set(tile.id, tile);
        this.grid[row][col] = tile.id;
    }

    move(direction) {
        for (const tile of this.tiles.values()) {
            tile.prevRow = tile.row;
            tile.prevCol = tile.col;
            tile.isNew = false;
            tile.isMerged = false;
            tile.removed = false;
            tile.mergedThisTurn = false;
        }

        let moved = false;
        const newGrid = Array.from({ length: this.size }, () => Array(this.size).fill(null));

        if (direction === 'left') moved = this.processLeft(newGrid);
        if (direction === 'right') moved = this.processRight(newGrid);
        if (direction === 'up') moved = this.processUp(newGrid);
        if (direction === 'down') moved = this.processDown(newGrid);

        if (!moved) return;

        this.grid = newGrid;
        this.addRandomTile();
        this.updateScore();
        this.isAnimating = true;
        this.renderTiles();

        window.setTimeout(() => {
            this.cleanupRemovedTiles();
            this.renderTiles(true);
            this.isAnimating = false;
            if (this.checkWin()) {
                this.showMessage('You Win!', 'Congratulations! You reached 2048!');
            } else if (this.checkGameOver()) {
                this.showMessage('Game Over!', 'No more moves available. Try again!');
            }
        }, this.animationMs + 10);
    }

    processLeft(newGrid) {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const ids = this.grid[r].filter((id) => id !== null);
            let target = 0;
            let lastTile = null;
            for (const id of ids) {
                const tile = this.tiles.get(id);
                if (lastTile && lastTile.value === tile.value && !lastTile.mergedThisTurn) {
                    lastTile.value *= 2;
                    lastTile.isMerged = true;
                    lastTile.mergedThisTurn = true;
                    tile.row = r;
                    tile.col = target - 1;
                    tile.removed = true;
                    this.score += lastTile.value;
                    moved = true;
                    continue;
                }
                tile.row = r;
                tile.col = target;
                newGrid[r][target] = tile.id;
                if (tile.prevCol !== tile.col) moved = true;
                lastTile = tile;
                target++;
            }
        }
        return moved;
    }

    processRight(newGrid) {
        let moved = false;
        for (let r = 0; r < this.size; r++) {
            const ids = this.grid[r].filter((id) => id !== null).reverse();
            let target = this.size - 1;
            let lastTile = null;
            for (const id of ids) {
                const tile = this.tiles.get(id);
                if (lastTile && lastTile.value === tile.value && !lastTile.mergedThisTurn) {
                    lastTile.value *= 2;
                    lastTile.isMerged = true;
                    lastTile.mergedThisTurn = true;
                    tile.row = r;
                    tile.col = target + 1;
                    tile.removed = true;
                    this.score += lastTile.value;
                    moved = true;
                    continue;
                }
                tile.row = r;
                tile.col = target;
                newGrid[r][target] = tile.id;
                if (tile.prevCol !== tile.col) moved = true;
                lastTile = tile;
                target--;
            }
        }
        return moved;
    }

    processUp(newGrid) {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const ids = [];
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] !== null) ids.push(this.grid[r][c]);
            }
            let target = 0;
            let lastTile = null;
            for (const id of ids) {
                const tile = this.tiles.get(id);
                if (lastTile && lastTile.value === tile.value && !lastTile.mergedThisTurn) {
                    lastTile.value *= 2;
                    lastTile.isMerged = true;
                    lastTile.mergedThisTurn = true;
                    tile.row = target - 1;
                    tile.col = c;
                    tile.removed = true;
                    this.score += lastTile.value;
                    moved = true;
                    continue;
                }
                tile.row = target;
                tile.col = c;
                newGrid[target][c] = tile.id;
                if (tile.prevRow !== tile.row) moved = true;
                lastTile = tile;
                target++;
            }
        }
        return moved;
    }

    processDown(newGrid) {
        let moved = false;
        for (let c = 0; c < this.size; c++) {
            const ids = [];
            for (let r = this.size - 1; r >= 0; r--) {
                if (this.grid[r][c] !== null) ids.push(this.grid[r][c]);
            }
            let target = this.size - 1;
            let lastTile = null;
            for (const id of ids) {
                const tile = this.tiles.get(id);
                if (lastTile && lastTile.value === tile.value && !lastTile.mergedThisTurn) {
                    lastTile.value *= 2;
                    lastTile.isMerged = true;
                    lastTile.mergedThisTurn = true;
                    tile.row = target + 1;
                    tile.col = c;
                    tile.removed = true;
                    this.score += lastTile.value;
                    moved = true;
                    continue;
                }
                tile.row = target;
                tile.col = c;
                newGrid[target][c] = tile.id;
                if (tile.prevRow !== tile.row) moved = true;
                lastTile = tile;
                target--;
            }
        }
        return moved;
    }

    cleanupRemovedTiles() {
        for (const [id, tile] of this.tiles.entries()) {
            if (!tile.removed) continue;
            const el = document.getElementById(`tile-${id}`);
            if (el) el.remove();
            this.tiles.delete(id);
        }
    }

    renderTiles(skipMoveAnimation = false) {
        const { step } = this.getCellMetrics();
        const presentIds = new Set();

        for (const tile of this.tiles.values()) {
            const id = `tile-${tile.id}`;
            let el = document.getElementById(id);
            const fromX = tile.prevCol * step;
            const fromY = tile.prevRow * step;
            const toX = tile.col * step;
            const toY = tile.row * step;

            if (!el) {
                el = document.createElement('div');
                el.id = id;
                el.className = 'tile';
                this.tileContainer.appendChild(el);
                el.style.transform = `translate(${fromX}px, ${fromY}px)`;
            }

            el.className = this.getTileClassName(tile);
            el.textContent = String(tile.value);
            if (skipMoveAnimation) {
                el.style.transition = 'none';
                el.style.transform = `translate(${toX}px, ${toY}px)`;
                void el.offsetHeight;
                el.style.transition = '';
            } else {
                requestAnimationFrame(() => {
                    el.style.transform = `translate(${toX}px, ${toY}px)`;
                });
            }

            presentIds.add(id);
        }

        this.tileContainer.querySelectorAll('.tile').forEach((el) => {
            if (!presentIds.has(el.id)) el.remove();
        });
    }

    getTileClassName(tile) {
        const classes = ['tile', `tile-${tile.value}`];
        if (tile.value > 2048) classes.push('tile-super');
        if (tile.isNew) classes.push('tile-new');
        if (tile.isMerged) classes.push('tile-merged');
        if (tile.removed) classes.push('tile-removing');
        return classes.join(' ');
    }

    clearTiles() {
        this.tileContainer.innerHTML = '';
    }

    updateScore() {
        this.scoreElement.textContent = String(this.score);
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', String(this.best));
        }
        this.bestElement.textContent = String(this.best);
    }

    checkWin() {
        for (const tile of this.tiles.values()) {
            if (!tile.removed && tile.value === 2048) return true;
        }
        return false;
    }

    checkGameOver() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const id = this.grid[r][c];
                if (id === null) return false;
                const value = this.tiles.get(id).value;
                if (r + 1 < this.size) {
                    const downId = this.grid[r + 1][c];
                    if (downId !== null && this.tiles.get(downId).value === value) return false;
                }
                if (c + 1 < this.size) {
                    const rightId = this.grid[r][c + 1];
                    if (rightId !== null && this.tiles.get(rightId).value === value) return false;
                }
            }
        }
        return true;
    }

    showMessage(title, text) {
        this.messageTitle.textContent = title;
        this.messageText.textContent = text;
        this.gameMessage.classList.add('show');
    }

    hideMessage() {
        this.gameMessage.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
