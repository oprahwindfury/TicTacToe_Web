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

        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.playerTurnElement = document.getElementById('player-turn');
        this.resetGameBtn = document.getElementById('reset-game');
        this.resetScoresBtn = document.getElementById('reset-scores');
        this.aiSettings = document.getElementById('ai-settings');

        // Game mode selection
        const gameModeInputs = document.querySelectorAll('input[name="game-mode"]');
        gameModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.isAIGame = e.target.value === 'ai';
                this.aiSettings.style.display = this.isAIGame ? 'block' : 'none';
                this.resetGame();
            });
        });

        // AI difficulty selection
        const difficultySelect = document.getElementById('ai-difficulty');
        difficultySelect.addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.resetGame();
        });

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
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
                if (this.checkWinner()) {
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
        return this.winningCombos.some(combo => {
            if (
                this.board[combo[0]] &&
                this.board[combo[0]] === this.board[combo[1]] &&
                this.board[combo[0]] === this.board[combo[2]]
            ) {
                combo.forEach(index => {
                    this.cells[index].classList.add('winner');
                });
                return true;
            }
            return false;
        });
    }

    checkWinnerForBoard(board) {
        for (let combo of this.winningCombos) {
            if (
                board[combo[0]] &&
                board[combo[0]] === board[combo[1]] &&
                board[combo[0]] === board[combo[2]]
            ) {
                return board[combo[0]];
            }
        }
        return null;
    }

    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.gameActive = false;
        fetch(`/update_score/${this.currentPlayer}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('player-x-score').textContent = data.player_x_score;
                document.getElementById('player-o-score').textContent = data.player_o_score;
            });
        this.playerTurnElement.parentElement.textContent = `Player ${this.currentPlayer} Wins!`;
    }

    handleDraw() {
        this.gameActive = false;
        this.playerTurnElement.parentElement.textContent = "It's a Draw!";
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.playerTurnElement.textContent = this.currentPlayer;
        this.playerTurnElement.style.color = this.currentPlayer === 'X' ? 'var(--bs-info)' : 'var(--bs-warning)';
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.gameActive = true;
        this.currentPlayer = 'X';
        this.playerTurnElement.textContent = 'X';
        this.playerTurnElement.parentElement.textContent = `Player ${this.currentPlayer}'s Turn`;
        this.playerTurnElement.style.color = 'var(--bs-info)';

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
    }

    resetScores() {
        fetch('/reset_scores')
            .then(response => response.json())
            .then(data => {
                document.getElementById('player-x-score').textContent = data.player_x_score;
                document.getElementById('player-o-score').textContent = data.player_o_score;
            });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});