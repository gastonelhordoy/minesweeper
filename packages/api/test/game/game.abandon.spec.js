/* eslint-env mocha */
'use strict'

const {
  ROWS_LIMITS,
  COLS_LIMITS,
  GAME_STATUS
} = require('minesweeper-common').constants
const platform = require('../utils')

describe('GAME ABANDON', () => {
  const ROWS = ROWS_LIMITS.min
  const COLS = COLS_LIMITS.min
  const MINES = ROWS_LIMITS.min
  let game

  beforeEach(async () => {
    await platform.data.startSandbox('game')
    game = await platform.data.createGame(ROWS, COLS, MINES)
  })

  afterEach(platform.endSandbox)

  it('should allow to abandon an active game', async () => {
    const client = platform.clients.custom(`api/v1/games/${game._id}`)
    const delRes = await client.del('/', 204)
    platform.expect(delRes.body).to.be.empty()

    const getRes = await client.get('/', 200)
    platform.expect(getRes.body).to.matchGame({
      rows: game.rows,
      cols: game.cols,
      mines: MINES,
      status: GAME_STATUS.abandoned
    })
  })

  it('should not allow to abandon a non-active game', async () => {
    const client = platform.clients.custom(`api/v1/games/${game._id}`)
    const delRes = await client.del('/', 204)
    platform.expect(delRes.body).to.be.empty()

    return client.del('/', 409)
  })
})
