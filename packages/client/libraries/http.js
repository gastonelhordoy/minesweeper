'use strict'

const _ = require('lodash')
const request = require('request')
const Promise = require('bluebird')
const url = require('url')
const qs = require('qs') // For parsing nested queries
const httpError = require('http-errors')

function setup (options) {
  const config = {}
  config.protocol = options.protocol || 'http'
  config.host = options.host || 'localhost:5001'
  config.path = options.path || '/api/v1'
  config.timeout = options.timeout
  config.verbose = !!options.verbose

  // HTTP Methods
  function call (params) {
    return new Promise(function resolver (resolve, reject) {
      // validations
      if (!config.host) {
        reject(new Error('No API host set, please configure the client'))
      } else if (!params.path) {
        reject(new Error('Missing request path.'))
      } else if (!_.isString(params.method)) {
        reject(new Error('Invalid "method" parameter.'))
      } else if ((params.method === 'put' || params.method === 'post') && !params.json) {
        reject(new Error('API call is Missing "json" parameter'))
      } else {
        const headers = params.headers || {}
        // Set auth headers
        if (params.token) {
          headers.Authorization = params.token
        }
        params.verbose = params.verbose || config.verbose

        // prepend API path (e.g. '/api/v1')
        const path = params.skipApiPath ? params.path : config.path + params.path

        const reqOptions = {
          method: params.method,
          headers: headers,
          uri: url.format({
            protocol: config.protocol,
            host: config.host,
            pathname: path,
            search: params.qs && qs.stringify(params.qs)
          }),
          encoding: 'utf-8',
          followRedirect: false,
          timeout: params.timeout || config.timeout,
          json: params.json || true
        }

        request(reqOptions, function (error, res, body) {
          const method = params.method.toUpperCase()
          const uri = reqOptions.uri

          // manage errors
          if (error) {
            if (params.verbose) {
              console.error('HTTP client error: %s %s', method, uri, error)
            }
            return reject(error)
          }

          // Warn about unexpected HTTP status codes
          if (res && res.statusCode >= 400) {
            if (params.verbose) {
              console.warn('%s %s failed with HTTP %d', method, uri, res.statusCode)
            }

            if (body && body.message) {
              // If API returns a specific error, re-create the Error object
              error = httpError(res.statusCode, body.message || body.msg, body)
            } else {
              // When the API process dies and the LB serves up non-JSON
              error = new httpError.ServiceUnavailable('API down')
            }

            // Attach response body to the error
            // error.res = res;
            return reject(error)
          }

          // Log the response if debug flag is passed in
          if (params.verbose) {
            console.log('API response:', body)
          }

          if (params.returnRes) {
            resolve(body, res)
          } else {
            resolve(body)
          }
        })
      }
    })
  }

  const instance = { call }
  // Sugar for HTTP methods
  const methods = [
    'head',
    'get',
    'post',
    'put',
    'patch',
    'delete'
  ]
  methods.forEach(method => {
    instance[method] = function (params) {
      params.method = method
      return call(params)
    }
  })

  return instance
}

module.exports = setup
