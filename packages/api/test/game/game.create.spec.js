/* eslint-env mocha */
'use strict'

const { ROWS_LIMITS, COLS_LIMITS, GAME_STATUS } = require('minesweeper-common').constants
const platform = require('../utils')

describe('GAME CREATE', async () => {
  beforeEach(() => {
    return platform.data.startSandbox('game')
  })

  afterEach(platform.endSandbox)

  it('should fail creating a new game without configuration', async () => {
    const client = platform.clients.custom('api/v1/games')
    await client.post('/', {}, 400)
  })

  it('should fail creating a new game with invalid rows', async () => {
    const client = platform.clients.custom('api/v1/games')
    const input = {
      rows: ROWS_LIMITS.min - 1,
      cols: COLS_LIMITS.min,
      mines: ROWS_LIMITS.min
    }
    await client.post('/', input, 400)
  })

  it('should fail creating a new game with invalid cols', async () => {
    const client = platform.clients.custom('api/v1/games')
    const input = {
      rows: ROWS_LIMITS.min,
      cols: COLS_LIMITS.min - 1,
      mines: ROWS_LIMITS.min
    }
    await client.post('/', input, 400)
  })

  it('should fail creating a new game with invalid mines', async () => {
    const client = platform.clients.custom('api/v1/games')
    const input = {
      rows: ROWS_LIMITS.min,
      cols: COLS_LIMITS.min,
      mines: ROWS_LIMITS.min * COLS_LIMITS.min + 1
    }
    await client.post('/', input, 400)
  })

  it('should create a new game in active status', async () => {
    const client = platform.clients.custom('api/v1/games')
    const input = {
      rows: ROWS_LIMITS.min,
      cols: COLS_LIMITS.min,
      mines: ROWS_LIMITS.min
    }
    const res = await client.post('/', input, 201)
    platform.expect(res.body).to.matchGame({
      rows: input.rows,
      cols: input.cols,
      mines: input.mines,
      status: GAME_STATUS.active
    })
  })
})
