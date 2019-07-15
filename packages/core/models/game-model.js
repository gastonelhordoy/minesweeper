'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const {
  ROWS_LIMITS,
  COLS_LIMITS,
  CELL_STATUS,
  GAME_STATUS
} = require('minesweeper-common').constants

const Cell = new Schema({
  _id: false,

  isMine: {
    type: Boolean,
    required: true
  },

  status: {
    type: String,
    required: true,
    enum: _.values(CELL_STATUS),
    default: CELL_STATUS.pristine
  }
})

// Game Schema
const Game = new Schema({
  rows: {
    type: Number,
    required: true,
    min: ROWS_LIMITS.min,
    max: ROWS_LIMITS.max
  },

  cols: {
    type: Number,
    required: true,
    min: COLS_LIMITS.min,
    max: COLS_LIMITS.max
  },

  cells: [Cell],

  status: {
    type: String,
    required: true,
    enum: _.values(GAME_STATUS),
    default: GAME_STATUS.active
  }
}, {
  collection: 'games',
  usePushEach: true,
  timestamps: true,
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
})

// VIRTUALS
Game.virtual('board').get(function () {
  return _.chunk(this.cells, this.cols)
})
Game.virtual('mines').get(function () {
  return this.cells.reduce((accum, cell) => {
    return accum + (cell.isMine ? 1 : 0)
  }, 0)
})

// MONGOOSE MODEL
mongoose.model('game', Game)
module.exports = Game
