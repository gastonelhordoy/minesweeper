'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const winston = require('winston')

const errorUtils = require('./libraries/error-utils')
const mongooseUtils = require('./libraries/mongoose-utils')

function bootstrap (nconf) {
  const isProd = process.env.NODE_ENV === 'production'

  return Promise.try(() => {
    // Initialize logging transports
    winston.remove(winston.transports.Console)
    winston.add(winston.transports.Console, {
      colorize: !isProd,
      timestamp: !isProd
    })

    // initialize error manager
    errorUtils.bootstrap()

    // bootstrap individual components
    return Promise.all([
      mongooseUtils.bootstrap(nconf)
    ])
  })

  .then(() => {
    // load all the schemas into mongoose models
    require('./models')
    // init facades passing in configuration
    module.exports.facades = require('./facades')
    _.each(module.exports.facades, facade => {
      facade.init(nconf)
    })
  })

  .then(() => {
    module.exports.errorManager = errorUtils.manager
    return module.exports
  })
}

module.exports = {
  bootstrap: _.once(bootstrap),

  mongoose: mongooseUtils.mongoose, // only for testing purposes
  isSameId: mongooseUtils.isSameId,
  isSameIdPredicate: mongooseUtils.isSameIdPredicate
}
