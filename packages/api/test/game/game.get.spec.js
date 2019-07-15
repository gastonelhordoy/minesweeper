/* eslint-env mocha */
'use strict'

const { ROWS_LIMITS, COLS_LIMITS, GAME_STATUS } = require('minesweeper-common').constants
const platform = require('../utils')

describe('GAME GET', async () => {
  const ROWS = ROWS_LIMITS.min
  const COLS = COLS_LIMITS.min
  const MINES = ROWS_LIMITS.min

  beforeEach(async () => {
    await platform.data.startSandbox('game')
  })

  afterEach(platform.endSandbox)

  it('should fail retrieving a non-existing game', async () => {
    const client = platform.clients.custom('api/v1/games')
    await client.get('/578756afb2078c075a23322c', 404)
  })

  it('should retrieve an existing game', async () => {
    const seed = await platform.data.createGame(ROWS, COLS, MINES)
    const client = platform.clients.custom(`api/v1/games/${seed._id}`)
    const res = await client.get('/', 200)
    platform.expect(res.body).to.matchGame({
      rows: ROWS,
      cols: COLS,
      mines: MINES,
      status: GAME_STATUS.active
    })
  })
})
