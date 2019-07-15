/* eslint-env mocha */
'use strict'

const { GAME_STATUS } = require('minesweeper-common').constants
const platform = require('../utils')

describe('GAME SEARCH', () => {
  beforeEach(() => {
    return platform.data.startSandbox('game')
  })

  afterEach(platform.endSandbox)

  it('should not list any game if none exists', async () => {
    const client = platform.clients.custom('api/v1/games')
    const res = await client.get('/', 200)
    platform.expect(res.body).to.be.an('array').with.length(0)
  })

  it('should list all the existing games (random)', async () => {
    const seed = await platform.data.createGames(5)
    const client = platform.clients.custom('api/v1/games')
    const res = await client.get('/', 200)
    platform.expect(res.body).to.be.an('array').with.length(seed.length)
  })

  it('should list all the existing games (all identical)', async () => {
    const ROWS = 6
    const COLS = 7
    const MINES = 8
    const GAME_TEMPLATE = {
      rows: ROWS,
      cols: COLS,
      mines: MINES,
      status: GAME_STATUS.active
    }

    const seed = await platform.data.createGames(10, ROWS, COLS, MINES)
    const client = platform.clients.custom('api/v1/games')
    const res = await client.get('/', 200)
    platform.expect(res.body).to.be.an('array').with.length(seed.length)
    res.body.forEach(game => {
      platform.expect(game).to.matchGame(GAME_TEMPLATE)
    })
  })
})
