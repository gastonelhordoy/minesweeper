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

  router.get('/', ctrl.search.bind(ctrl))
  router.post('/', ctrl.create.bind(ctrl))
  router.get('/:id', ctrl.getById.bind(ctrl))
  router.delete('/:id', ctrl.remove.bind(ctrl))

  // board actions
  router.post('/:id/board/:row/:col/reveal', ctrl.revealCell.bind(ctrl))

  return router
}

module.exports = {
  mount,
  controller: ctrl
}
