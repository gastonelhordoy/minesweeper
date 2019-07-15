'use strict'

const _ = require('lodash')
const express = require('express')
const Controller = require('../libraries/controller')

class GameController extends Controller {
  constructor () {
    super('game', {
      formatter: o => {
        return _.pick(o, ['_id', 'status', 'rows', 'cols', 'mines', 'createdAt', 'board'])
      },
      listFormatter: o => {
        return _.pick(o, ['_id', 'status', 'rows', 'cols', 'mines', 'createdAt'])
      }
    })
  }

  revealCell (req, res, next) {
    const id = req.params.id
    const row = parseInt(req.params.row)
    const col = parseInt(req.params.col)

    this.facade.revealCell(id, row, col).then(res.json).catch(next)
  }
}

const ctrl = new GameController()

function mount () {
  const router = express.Router()

  /**
   * @swagger
   *
   * definitions:
   *   NewGame:
   *     type: object
   *     required:
   *       - rows
   *       - cols
   *       - mines
   *     properties:
   *       rows:
   *         type: integer
   *         minimum: 5
   *         maximum: 50
   *       cols:
   *         type: integer
   *         minimum: 5
   *         maximum: 50
   *       mines:
   *         type: integer
   *         minimum: 1
   *
   *   GameSummary:
   *     type: object
   *     required:
   *       - _id
   *       - rows
   *       - cols
   *       - mines
   *       - status
   *     properties:
   *       _id:
   *         type: string
   *       rows:
   *         type: integer
   *         minimum: 5
   *         maximum: 50
   *       cols:
   *         type: integer
   *         minimum: 5
   *         maximum: 50
   *       mines:
   *         type: integer
   *         minimum: 1
   *       status:
   *         type: string
   *         enum: [active, won, lost, abandoned]
   *
   *   Cell:
   *     type: object
   *     required:
   *       - status
   *       - isMine
   *     properties:
   *       status:
   *         type: string
   *         enum: [pristine, uncovered, flag, question]
   *       isMine:
   *         type: boolean
   *
   *   Game:
   *     allOf:
   *       - $ref: '#/definitions/GameSummary'
   *       - type: object
   *         required:
   *           - board
   *         properties:
   *           board:
   *             type: array
   *             items:
   *               type: array
   *               items:
   *                 $ref: '#/definitions/Cell'
   */

  /**
   * @swagger
   * /games:
   *   get:
   *     description: Search games
   *     produces:
   *      - application/json
   *     responses:
   *       200:
   *         description: List of existing games.
   *         schema:
   *           type: array
   *           items:
   *             $ref: '#/definitions/GameSummary'
   */
  router.get('/', ctrl.search.bind(ctrl))

  /**
   * @swagger
   * /games:
   *   post:
   *     description: Create new game
   *     consumes:
   *      - application/json
   *     produces:
   *      - application/json
   *     parameters:
   *       - in: body
   *         name: newGame
   *         description: New game configuration
   *         required: true
   *         schema:
   *           $ref: '#/definitions/NewGame'
   *     responses:
   *       200:
   *         description: The new game created.
   *         schema:
   *           $ref: '#/definitions/Game'
   *       400:
   *         description: Bad request. Invalid board configuration.
   */
  router.post('/', ctrl.create.bind(ctrl))

  /**
   * @swagger
   * /games/{id}:
   *   get:
   *     description: Retrieve a game by it's identifier
   *     produces:
   *      - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The game identifier
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: The requested game.
   *         schema:
   *           $ref: '#/definitions/Game'
   *       404:
   *         description: Not Found. There is no game with the specified identifier.
   */
  router.get('/:id', ctrl.getById.bind(ctrl))

  /**
   * @swagger
   * /games/{id}:
   *   delete:
   *     description: Abandon a game
   *     produces:
   *      - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The game identifier
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: The game was marked as abandoned.
   *       404:
   *         description: Not Found. There is no game with the specified identifier.
   *       409:
   *         description: Game is not active and therefore it cannot be marked as abandoned.
   */
  router.delete('/:id', ctrl.remove.bind(ctrl))

  // board actions
  router.post('/:id/board/:row/:col/reveal', ctrl.revealCell.bind(ctrl))

  return router
}

module.exports = {
  mount,
  controller: ctrl
}
