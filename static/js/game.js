class TicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.board = Array(9).fill('');
        this.gameActive = true;
        this.isAIGame = false;
        this.aiDifficulty = 'easy';
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        // Wait for DOM to be fully loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeGame());
        } else {
            this.initializeGame();
        }
    }

    initializeGame() {
        // Cache DOM elements
        this.cells = Array.from(document.querySelectorAll('.cell'));
        this.playerTurnElement = document.getElementById('player-turn');
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.resetGameBtn = document.getElementById('reset-game');
        this.resetScoresBtn = document.getElementById('reset-scores');
        this.aiSettings = document.getElementById('ai-settings');

        if (!this.cells.length || !this.playerTurnElement || !this.resetGameBtn || !this.resetScoresBtn) {
            console.error('Required DOM elements not found');
            return;
        }

        // Game mode selection
        const gameModeInputs = document.querySelectorAll('input[name="game-mode"]');
        gameModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.isAIGame = e.target.value === 'ai';
                if (this.aiSettings) {
                    this.aiSettings.style.display = this.isAIGame ? 'block' : 'none';
                }
                this.resetGame();
            });
        });

        // AI difficulty selection
        const difficultySelect = document.getElementById('ai-difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.aiDifficulty = e.target.value;
                this.resetGame();
            });
        }

        // Add event listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());

        // Initialize the game state
        this.resetGame();
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;

        if (this.board[index] || !this.gameActive || (this.isAIGame && this.currentPlayer === 'O')) return;

        this.makeMove(index);

        if (this.isAIGame && this.gameActive) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        if (!this.cells[index]) return;

        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add('marked', this.currentPlayer.toLowerCase());

        if (this.checkWinner()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            default:
                move = this.getRandomMove();
        }
        if (move !== null) {
            this.makeMove(move);
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : null;
    }

    getMediumMove() {
        // Check for winning move
        const winningMove = this.findWinningMove('O');
        if (winningMove !== null) return winningMove;

        // Block opponent's winning move
        const blockingMove = this.findWinningMove('X');
        if (blockingMove !== null) return blockingMove;

        // Take center if available
        if (this.board[4] === '') return 4;

        // Take random move
        return this.getRandomMove();
    }

    findWinningMove(player) {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                if (this.checkWinnerForBoard(this.board)) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        return null;
    }

    getHardMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinnerForBoard(board);
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (this.isBoardFull(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false));
                    board[i] = '';
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true));
                    board[i] = '';
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        return this.checkWinnerForBoard(this.board) !== null;
    }

    checkWinnerForBoard(board) {
        for (let combo of this.winningCombos) {
            if (
                board[combo[0]] &&
                board[combo[0]] === board[combo[1]] &&
                board[combo[0]] === board[combo[2]]
            ) {
                if (this.cells) {
                    combo.forEach(index => {
                        this.cells[index].classList.add('winner');
                    });
                }
                return board[combo[0]];
            }
        }
        return null;
    }

    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    checkDraw() {
        return this.isBoardFull(this.board);
    }

    handleWin() {
        this.gameActive = false;
        const winner = this.currentPlayer;

        fetch(`/update_score/${winner}`)
            .then(response => response.json())
            .then(data => {
                const xScore = document.getElementById('player-x-score');
                const oScore = document.getElementById('player-o-score');
                if (xScore) xScore.textContent = data.player_x_score;
                if (oScore) oScore.textContent = data.player_o_score;
            });

        if (this.playerTurnElement) {
            this.playerTurnElement.parentElement.textContent = `Player ${winner} Wins!`;
        }
    }

    handleDraw() {
        this.gameActive = false;
        if (this.playerTurnElement) {
            this.playerTurnElement.parentElement.textContent = "It's a Draw!";
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        if (this.playerTurnElement) {
            this.playerTurnElement.textContent = this.currentPlayer;
            this.playerTurnElement.style.color = this.currentPlayer === 'X' ? 'var(--bs-info)' : 'var(--bs-warning)';
        }
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.gameActive = true;
        this.currentPlayer = 'X';

        if (this.playerTurnElement) {
            this.playerTurnElement.textContent = 'X';
            const parentElement = this.playerTurnElement.parentElement;
            if (parentElement) {
                parentElement.textContent = "Player ";
                parentElement.appendChild(this.playerTurnElement);
                parentElement.appendChild(document.createTextNode("'s Turn"));
            }
            this.playerTurnElement.style.color = 'var(--bs-info)';
        }

        this.cells.forEach(cell => {
            if (cell) {
                cell.textContent = '';
                cell.className = 'cell';
            }
        });
    }

    resetScores() {
        fetch('/reset_scores')
            .then(response => response.json())
            .then(data => {
                const xScore = document.getElementById('player-x-score');
                const oScore = document.getElementById('player-o-score');
                if (xScore) xScore.textContent = data.player_x_score;
                if (oScore) oScore.textContent = data.player_o_score;
            });
        this.resetGame();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});