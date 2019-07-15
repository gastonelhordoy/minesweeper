'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const winston = require('winston')
const mongoose = require('mongoose')

function bootstrap (nconf) {
  // http://mongoosejs.com/docs/promises.html
  mongoose.Promise = require('bluebird')
  if (nconf.isTrue('MONGODB:DEBUG_MODE')) {
    mongoose.set('debug', true)
    // mongoose.set('debug', (col, method, query, doc, options) => {
    //   winston.info(`MONGOOSE: ${col}.${method}(${JSON.stringify(query)})`)
    // })
  }

  // connect to mongo
  let connectionResolved = false

  function handleConnectionInfo (parts) {
    module.exports.parts = parts
    const servers = _.map(parts.servers, server => {
      return `${server.host}:${server.port}`
    })
    winston.info(`MONGO: ${servers.join(', ')}`)
  }
  function parseConnectionUrl (connectionUrl) {
    // parse URL and keep parts
    const urlParser = require('mongodb/lib/url_parser')
    if (urlParser.length === 3) {
      // mongodb 3 uses callback as a thrid argument
      // https://github.com/mongodb/node-mongodb-native/commit/0e3768599ad4c8e67c7ec3641a70b8bf4f8273a3#diff-76c25e5cd600a6d00d83d3194514d486L9
      urlParser(connectionUrl, (err, parts) => {
        if (!err) {
          return handleConnectionInfo(parts)
        }
        winston.error(`MONGO: error parsing connection string | ${err.message}`)
      })
    } else {
      handleConnectionInfo(urlParser(connectionUrl))
    }
  }

  return new Promise((resolve, reject) => {
    const connectionUrl = nconf.get('MONGODB:URL')
    parseConnectionUrl(connectionUrl)

    const autoIndex = nconf.isTrue('MONGODB:INDEXES')
    winston.info(`MONGO: autoIndex ${autoIndex}`)
    const poolSize = nconf.asInt('MONGODB:POOL_SIZE') || 10
    winston.info(`MONGO: poolSize ${poolSize}`)

    const connectionOptions = {
      // http://mongoosejs.com/docs/guide.html#indexes
      // https://github.com/Automattic/mongoose/issues/1875
      autoIndex,
      poolSize,

      // deprecation warnings
      // https://mongoosejs.com/docs/deprecations.html
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,

      // mLab recommended mongoose connection options
      // http://blog.mlab.com/2014/04/mongodb-driver-mongoose/
      auto_reconnect: true,
      reconnectTries: 6307200, // 1 year
      reconnectInterval: 5000, // every 5 seconds
      keepAlive: 300000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000
    }

    mongoose.connect(connectionUrl, connectionOptions)

    const conn = mongoose.connection
    conn.on('connected', () => {
      winston.info('MONGO: ready')
      connectionResolved = true
      resolve()
    })
    conn.on('error', err => {
      winston.error('MONGO:', err.message)
      // retry if mongo is not ready on startup
      mongoose.disconnect()
      setTimeout(() => {
        mongoose.connect(connectionUrl, connectionOptions)
      }, 5000)
      if (!connectionResolved) {
        reject(err)
      }
    })
    conn.on('disconnected', () => {
      winston.warn('MONGO: disconnected...')
    })
    conn.on('reconnected', () => {
      winston.info('MONGO: reconnected...')
    })
  })
}

module.exports = {
  bootstrap: _.once(bootstrap),
  mongoose
}
