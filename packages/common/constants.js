'use strict'

const ROWS_LIMITS = {
  min: 5,
  max: 50
}
const COLS_LIMITS = {
  min: 5,
  max: 50
}

const CELL_STATUS = {
  pristine: 'pristine',
  question: 'question', // question mark
  flag: 'flag', // potential bomb
  uncovered: 'uncovered'
}

const MARK_TYPES = [CELL_STATUS.question, CELL_STATUS.flag]

const GAME_STATUS = {
  active: 'active',
  lost: 'lost',
  won: 'won',
  abandoned: 'abandoned'
}

module.exports = {
  ROWS_LIMITS,
  COLS_LIMITS,

  MARK_TYPES,
  CELL_STATUS,
  GAME_STATUS
}
