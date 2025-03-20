class TicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.board = Array(9).fill('');
        this.gameActive = true;
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

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        
        if (this.board[index] || !this.gameActive) return;

        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add('marked', this.currentPlayer.toLowerCase());

        if (this.checkWinner()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }

    checkWinner() {
        return this.winningCombos.some(combo => {
            if (
                this.board[combo[0]] &&
                this.board[combo[0]] === this.board[combo[1]] &&
                this.board[combo[0]] === this.board[combo[2]]
            ) {
                // Highlight winning cells
                combo.forEach(index => {
                    this.cells[index].classList.add('winner');
                });
                return true;
            }
            return false;
        });
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
