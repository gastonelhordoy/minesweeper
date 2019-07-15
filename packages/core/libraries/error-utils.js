'use strict'

const _ = require('lodash')
const httpErrors = require('http-errors')

const STATUS_CODES = {
  400: 'BadRequest',
  401: 'Unauthorized',
  402: 'PaymentRequired',
  403: 'Forbidden',
  404: 'NotFound',
  405: 'MethodNotAllowed',
  409: 'Conflict',
  500: 'Internal',
  502: 'BadGateway',
  503: 'ServiceUnavailable'
}

class ErrorManager {
  constructor () {
    const self = this

    // init error constructors and rejection shortcuts
    _.each(STATUS_CODES, (name, statusCode) => {
      statusCode = parseInt(statusCode)

      self[name] = (message, extras) => httpErrors(statusCode, message, extras)
      self['reject' + name] = (message, extras) => {
        return Promise.reject(httpErrors(statusCode, message, extras))
      }
    })
  }

  getStatusName (status) {
    return STATUS_CODES[status]
  }
}

function bootstrap () {
  module.exports.manager = new ErrorManager()
}

module.exports = {
  bootstrap: _.once(bootstrap)
  // getStatusName: status => {
  //   return STATUS_CODES[status]
  // }
}
