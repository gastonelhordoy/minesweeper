'use strict'

const winston = require('winston')
const router = require('express').Router()
const responseTime = require('response-time')
const common = require('irie-utils')
const core = require('minesweeper-core')
const errorManager = core.errorManager

const routes = common.requireAll(__dirname, {
  stripFromName: '-routes'
})

router.get('/', function rootRoute (req, res) {
  res.send({ result: 'OK' })
})

module.exports = function buildRoutes (app) {
  // bind res.json so it can be passed as a handler in then methods for promises
  app.use((req, res, next) => {
    res.json = res.json.bind(res)
    next()
  })

  // non-authenticated routes
  app.use(router)
  app.use(responseTime())

  // CATCH ALL, if request reaches this point it means route was not found
  app.use(function notFoundController (req, res, next) {
    next(errorManager.NotFound('Service not found'))
  })

  // error-handling middleware triggered when next(err) is called
  app.use(function genericErrorMiddleware (err, req, res, next) {
    err.statusCode = err.statusCode || 500

    if (err.statusCode !== 404) {
      winston.error(err)
    }

    const message = err.message || 'Unexpected error'
    res.status(err.statusCode).send({
      name: err.name,
      message,
      errors: err.errors,
      data: err.data
    })
  })
}
