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

function countMines (board) {
  let mines = 0
  for (let i = board.length - 1; i >= 0; i--) {
    for (let j = board[i].length - 1; j >= 0; j--) {
      mines += board[i][j].isMine ? 1 : 0
    }
  }
  return mines
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

function countAdjacentMines (board, row, col) {
  let minesCount = 0

  function checkCell (r, c) {
    if (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c].isMine) {
      minesCount++
    }
  }

  checkCell(row + 1, col)
  checkCell(row - 1, col)
  checkCell(row, col + 1)
  checkCell(row, col - 1)
  checkCell(row + 1, col + 1)
  checkCell(row - 1, col - 1)
  checkCell(row - 1, col + 1)
  checkCell(row + 1, col - 1)

  return minesCount
}

// https://en.wikipedia.org/wiki/Flood_fill
// https://stackoverflow.com/questions/14076090/floodfill-minesweeper-explanation-needed
function floodFillBoard (board, row, col, changes) {
  const cell = board[row] && board[row][col]
  changes = changes || []

  if (!cell || cell.isMine || cell.status === CELL_STATUS.uncovered) {
    return changes
  }

  // track board state change
  cell.status = CELL_STATUS.uncovered
  changes.push({ row, col, status: CELL_STATUS.uncovered })

  // check surrouding mines and keep flooding if there are none
  const adjacentMines = countAdjacentMines(board, row, col)
  if (!adjacentMines) {
    floodFillBoard(board, row + 1, col, changes)
    floodFillBoard(board, row - 1, col, changes)
    floodFillBoard(board, row, col + 1, changes)
    floodFillBoard(board, row, col - 1, changes)
    floodFillBoard(board, row + 1, col + 1, changes)
    floodFillBoard(board, row - 1, col - 1, changes)
    floodFillBoard(board, row - 1, col + 1, changes)
    floodFillBoard(board, row + 1, col - 1, changes)
  }

  return changes
}

function checkBoardCompleted (board) {
  for (let i = board.length - 1; i >= 0; i--) {
    for (let j = board[i].length - 1; j >= 0; j--) {
      const cell = board[i][j]
      if (!cell.isMine && cell.status !== CELL_STATUS.uncovered) {
        return false
      }
    }
  }
  return true
}

function findCell (board, predicate) {
  for (var i = board.length - 1; i >= 0; i--) {
    for (var j = board[i].length - 1; j >= 0; j--) {
      const cell = board[i][j]
      if (cell.isMine === predicate.isMine && cell.status === predicate.status) {
        return { row: i, col: j }
      }
    }
  }
}

module.exports = {
  generateBoard,
  placeMines,
  countMines,
  countAdjacentMines,
  floodFillBoard,
  checkBoardCompleted,
  findCell
}
