'use strict'

const _ = require('lodash')
const {
  ROWS_LIMITS,
  COLS_LIMITS,
  GAME_STATUS
} = require('minesweeper-common').constants
const boardHelper = require('minesweeper-common').board

const Facade = require('../libraries/facade')


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
