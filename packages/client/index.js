'use strict'

const resources = require('./resources')

class Client {
  constructor (options, token) {
    const http = require('./libraries/http')(options)

    Object.keys(resources).forEach(key => {
      this[key] = new resources[key](http, token)
    })
  }
}

module.exports = Client
