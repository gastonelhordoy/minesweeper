'use strict'

const _ = require('lodash')
const core = require('minesweeper-core')

class Controller {
  constructor (facade, options) {
    if (_.isString(facade)) {
      facade = core.facades[facade]
    }
    if (!facade) {
      throw new Error('A Facade must be provided for the new Controller')
    }
    this.facade = facade

    options = options || {}
    this.formatter = options.formatter
    this.listFormatter = options.listFormatter
  }

  /**
   * GET /
   */
  search (req, res, next) {
    const conditions = req.query || {}

    this.facade.search(conditions)
      .then(list => {
        if (this.listFormatter) {
          list = _.map(list, this.listFormatter)
        }
        res.json(list)
      })
      .catch(next)
  }

  /**
   * GET /:id
   */
  getById (req, res, next) {
    const id = req.params.id

    this.facade.getById(id)
      .then(object => {
        if (this.formatter) {
          object = this.formatter(object)
        }
        res.json(object)
      })
      .catch(next)
  }

  /**
   * POST /
   */
  create (req, res, next) {
    const input = req.body

    this.facade.create(input)
      .then(object => {
        if (this.formatter) {
          object = this.formatter(object)
        }
        res.status(201).json(object)
      })
      .catch(next)
  }

  /**
   * PATCH /:id
   */
  update (req, res, next) {
    const id = req.params.id
    const input = req.body

    this.facade.update(id, input)
      .then(object => {
        if (this.formatter) {
          object = this.formatter(object)
        }
        res.status(201).json(object)
      })
      .catch(next)
  }

  /**
   * DELETE /:id
   */
  remove (req, res, next) {
    const id = req.params.id

    this.facade.remove(id)
      .then(() => {
        res.status(204).json(null)
      })
      .catch(next)
  }
}

module.exports = Controller
