'use strict'

const _ = require('lodash')
const {
  ROWS_LIMITS,
  COLS_LIMITS,
  CELL_STATUS,
  GAME_STATUS
} = require('minesweeper-common').constants
const boardHelper = require('minesweeper-common').board

const Facade = require('../libraries/facade')

function buildResult (game, changes, delta) {
  if (delta) {
    return {
      status: game.status,
      changes
    }
  }
  return game
}

class GameFacade extends Facade {
  constructor () {
    super('game')
  }

  async create (input) {
    const { rows, cols, mines } = input || {}
    const errors = []
    if (!rows) {
      errors.push('The number of rows is mandatory')
    } else if (rows < ROWS_LIMITS.min || rows > ROWS_LIMITS.max) {
      errors.push(`The number of rows must be between ${ROWS_LIMITS.min} and ${ROWS_LIMITS.max} `)
    }
    if (!cols) {
      errors.push('The number of columns is mandatory')
    } else if (cols < COLS_LIMITS.min || cols > COLS_LIMITS.max) {
      errors.push(`The number of rows must be between ${COLS_LIMITS.min} and ${COLS_LIMITS.max} `)
    }
    if (!mines || mines < 1) {
      errors.push('The number of mines must be bigger than zero')
    } else if (mines > rows * cols) {
      errors.push('The number of mines is bigger than the number of cells in the board')
    }
    if (errors.length) {
      throw this.errorManager.BadRequest('Invalid board configuration for new game', { errors })
    }

    const board = boardHelper.generateBoard(rows, cols, mines)
    const game = {
      rows,
      cols,
      cells: _.flatten(board),
      status: GAME_STATUS.active
    }
    return super.create(game)
  }

  async getByIdAndValidateCell (id, row, col, activeGame) {
    const game = await this.getById(id)

    if (activeGame && game.status !== GAME_STATUS.active) {
      throw this.errorManager.Conflict('Game is not active')
    }

    const errors = []
    if (row < 0 || row >= game.board.length) {
      errors.push('Row number out of bounds')
    }
    if (col < 0 || col >= game.board[0].length) {
      errors.push('Column number out of bounds')
    }
    if (errors.length) {
      throw this.errorManager.BadRequest('Invalid cell', { errors })
    }
    return { game, cell: game.board[row][col] }
  }

  async revealCell (id, row, col, delta) {
    const { game, cell } = await this.getByIdAndValidateCell(id, row, col, true)

    // uncovered cells cannot be uncovered more than once
    if (cell.status === CELL_STATUS.uncovered) {
      throw this.errorManager.Conflict('Cell has already been uncovered')
    }

    // check if cell is a mine
    if (cell.isMine) {
      game.status = GAME_STATUS.lost
      cell.status = CELL_STATUS.uncovered
      await game.save()
      return buildResult(game, [{ row, col, status: cell.status }], delta)
    }

    // flood logic
    const changes = boardHelper.floodFillBoard(game.board, row, col)
    const completed = boardHelper.checkBoardCompleted(game.board)
    if (completed) {
      game.status = GAME_STATUS.won
    }

    // persist game status
    await game.save()
    return buildResult(game, changes, delta)
  }

  async remove (id) {
    const game = await this.getById(id)
    if (game.status !== GAME_STATUS.active) {
      throw this.errorManager.Conflict('Only active games con be abandoned')
    }
    game.status = GAME_STATUS.abandoned
    await game.save()
  }
}

module.exports = new GameFacade()
