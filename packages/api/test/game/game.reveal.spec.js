/* eslint-env mocha */
'use strict'

const {
  ROWS_LIMITS,
  COLS_LIMITS,
  CELL_STATUS,
  GAME_STATUS
} = require('minesweeper-common').constants
const boardHelper = require('minesweeper-common').board
const platform = require('../utils')

describe('GAME REVEAL', async () => {
  const expect = platform.expect
  const ROWS = ROWS_LIMITS.min
  const COLS = COLS_LIMITS.min
  const MINES = ROWS_LIMITS.min
  let seed

  beforeEach(async () => {
    await platform.data.startSandbox('game')
    seed = await platform.data.createGame(ROWS, COLS, MINES)
  })

  afterEach(platform.endSandbox)

  it('should fail when revealing an invalid cell', async () => {
    const client = platform.clients.custom(`api/v1/games/${seed._id}`)
    await client.post(`/board/${ROWS + 1}/${0}/reveal`, {}, 400)
  })

  it('should switch game to lost status when hitting a mine', async () => {
    const client = platform.clients.custom(`api/v1/games/${seed._id}`)
    const mineCell = boardHelper.findCell(seed.board, {
      isMine: true,
      status: CELL_STATUS.pristine
    })

    const res = await client.post(`/board/${mineCell.row}/${mineCell.col}/reveal`, {}, 200)
    expect(res.body).to.matchGame({
      rows: ROWS,
      cols: COLS,
      mines: MINES,
      status: GAME_STATUS.lost
    })
    expect(res.body.board).to.be.an('array')
    const resultCell = res.body.board[mineCell.row][mineCell.col]
    expect(resultCell).to.be.ok()
    expect(resultCell.status).to.be.equal(CELL_STATUS.uncovered)
    expect(resultCell.isMine).to.be.true()
  })

  it('should switch game to won status when completing board', async () => {
    const client = platform.clients.custom(`api/v1/games/${seed._id}`)

    const emptyCellPredicate = { isMine: false, status: CELL_STATUS.pristine }
    let emptyCell = boardHelper.findCell(seed.board, emptyCellPredicate)
    let game

    while (emptyCell) {
      const res = await client.post(`/board/${emptyCell.row}/${emptyCell.col}/reveal`, {}, 200)
      game = res.body

      const resultCell = game.board[emptyCell.row][emptyCell.col]
      expect(resultCell).to.be.ok()
      expect(resultCell.status).to.be.equal(CELL_STATUS.uncovered)
      expect(resultCell.isMine).to.be.false()

      emptyCell = boardHelper.findCell(game.board, emptyCellPredicate)
    }

    expect(game).to.matchGame({
      rows: ROWS,
      cols: COLS,
      mines: MINES,
      status: GAME_STATUS.won
    })
  })
})
