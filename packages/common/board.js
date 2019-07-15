'use strict'

const { CELL_STATUS } = require('./constants')

function placeMines (board, mines) {
  const rows = board.length
  const cols = board[0].length

  // Generate random mine placement
  while (mines) {
    let row = Math.floor(Math.random() * rows)
    let col = Math.floor(Math.random() * cols)

    if (!board[row][col].isMine) {
      board[row][col].isMine = true
      mines--
    }
  }
  return board
}

function generateBoard (rows, cols, mines) {
  const board = []
  // Create board of zeros
  for (let i = rows - 1; i >= 0; i--) {
    board[i] = []
    for (let j = cols - 1; j >= 0; j--) {
      board[i][j] = {
        status: CELL_STATUS.pristine,
        isMine: false
      }
    }
  }

  return placeMines(board, mines)
}

module.exports = {
  generateBoard,
  placeMines
}
