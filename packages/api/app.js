'use strict'

const http = require('http')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const noFavicon = require('express-no-favicons')
// const favicon = require('serve-favicon')
const morgan = require('morgan')
// const forceSsl = require('./libraries/force-ssl')

const Promise = require('bluebird')
const path = require('path')
const winston = require('winston')
const nconf = require('irie-utils').config('api')

const fs = require('fs')
Promise.promisifyAll(fs)

const isProd = process.env.NODE_ENV === 'production'

// on a development environment, enable better debugging experience
// https://github.com/petkaantonov/bluebird/blob/master/API.md#promiselongstacktraces---void
const promiseConfig = {
  // Enables all warnings except forgotten return statements.
  warnings: {
    wForgottenReturn: false
  },
  longStackTraces: false
}
if (!isProd) {
  promiseConfig.longStackTraces = true
  Error.stackTraceLimit = Infinity
}
Promise.config(promiseConfig)

// configure log level
winston.level = nconf.get('LOG_LEVEL') || (isProd ? 'info' : 'debug')

// bootstrap the core business logic module
module.exports = require('minesweeper-core').bootstrap(nconf)
  .then(() => {
    let CORS_ORIGINS = nconf.get('CORS:ORIGINS')
    if (typeof CORS_ORIGINS === 'string') {
      try {
        CORS_ORIGINS = JSON.parse(CORS_ORIGINS)
      } catch (err) {
        winston.error('CORS ORIGINS error: ' + CORS_ORIGINS + ' - ' + err.message)
        CORS_ORIGINS = []
      }
    }
    const CORS_OPTIONS = {
      origin: function (origin, callback) {
        const originIsWhitelisted = CORS_ORIGINS.indexOf(origin) !== -1
        callback(null, originIsWhitelisted)
      }
    }

    const app = express()
    app.use(helmet())

    // morgan logger setup
    const morganLevel = nconf.get('MORGAN_LEVEL')
    app.use(morgan(morganLevel !== 'mute' ? morganLevel : () => {}))

    //
    // EXPRESS
    //
    app.enable('trust proxy')
    app.disable('x-powered-by')
    app.set('port', nconf.asInt('PORT'))

    // view engine setup (just to comply with express, not really needed)
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'html')

    //
    // MIDDLEWARES
    //

    app.use(noFavicon())
    // app.use(favicon(__dirname + '/public/favicon.ico'))
    // app.use(forceSsl())
    app.use(compression())
    app.use(bodyParser.json({
      limit: '500kb' // https://github.com/expressjs/body-parser#limit
    }))
    app.use(bodyParser.urlencoded({
      limit: '500kb', // https://github.com/expressjs/body-parser#limit-3
      parameterLimit: 100, // https://stackoverflow.com/a/36514330/2115580
      extended: true
    }))

    //
    // ROUTES
    //
    winston.info('CORS: ' + CORS_ORIGINS.join(', '))
    app.use(cors(CORS_OPTIONS))
    require('./routes')(app)

    //
    // START UP
    //
    if (require.main === module) {
    // should be same as: if (!module.parent) {
    // https://github.com/nodejs/node/issues/9705
    // https://nodejs.org/api/modules.html#modules_accessing_the_main_module
      const port = app.get('port')
      http.createServer(app).listen(port, function () {
        winston.info('API: server timeout ' + this.timeout)
        winston.info('API: listening on port ' + port)
      })
    } else {
      return app
    }
  })
  .catch(err => {
    winston.error('ERROR STARTING UP SERVER ' + err.stack)
    process.exit(1)
  })
