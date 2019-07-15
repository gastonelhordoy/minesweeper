'use strict'

const _ = require('lodash')
const supertest = require('supertest')
const expect = require('chai').expect

// utility for checking leading slash /
function checkPath (path) {
  return _.startsWith(path, '/') ? path : `/${path}`
}

/**
 * Generic Client with low level interface.
 */
class Client {
  constructor (request, prefix, token) {
    if (!request) {
      throw new Error('request is mandatory for creating a Client')
    }

    this.request = request

    if (_.isString(prefix)) {
      this.prefix = checkPath(prefix)
    }

    this.token = token
  }

  dispatch (promise, status) {
    if (this.token) {
      promise = promise.set('Authorization', `Bearer ${this.token}`)
    }
    _.each(this.headers, (value, name) => {
      promise = promise.set(name, value)
    })

    // generic assertions on response status
    if (status) {
      promise = promise.expect(status)
      if (status !== 204) { // status 204 means no content
        promise = promise.expect('Content-Type', /json/)
      }
    }

    return promise
  }

  dispatchWithBody (method, path, body, status) {
    if (!_.isString(path)) {
      throw new Error('Path param must be a string')
    }
    if (!_.isPlainObject(body)) {
      throw new Error('Body param must be a plain object')
    }
    if (!_.isFinite(status)) {
      throw new Error('Status param must be a number')
    }
    path = this.url(path)
    const promise = this.request[method](path).send(body)
    return this.dispatch(promise, status)
  }

  url (path) {
    path = checkPath(path)
    if (this.prefix) {
      return `${this.prefix}${path}`
    }
    return path
  }

  setHeader (name, value) {
    if (!_.isString(name) || _.isEmpty(name)) {
      throw new Error('Header name param must be a string')
    }
    if (!_.isString(value) || _.isEmpty(value)) {
      throw new Error('Header value param must be a string')
    }
    this.headers = this.headers || {}
    this.headers[name] = value
  }

  setHeaders (headers) {
    if (!_.isPlainObject(headers) || _.isEmpty(headers)) {
      throw new Error('Headers param must be a not empty plain object')
    }
    this.headers = headers
  }

  clearHeaders () {
    delete this.headers
  }

  clearHeader (name) {
    if (this.headers) {
      delete this.headers[name]
    }
  }

  get (path, query, status) {
    if (!status && _.isFinite(query)) {
      status = query
      query = undefined
    }
    path = this.url(path)
    let promise = this.request.get(path)
    if (query) {
      promise.query(query)
    }
    return this.dispatch(promise, status)
  }

  post (path, body, status) {
    return this.dispatchWithBody('post', path, body, status)
  }

  put (path, body, status) {
    return this.dispatchWithBody('put', path, body, status)
  }

  patch (path, body, status) {
    return this.dispatchWithBody('patch', path, body, status)
  }

  del (path, status) {
    path = this.url(path)
    const promise = this.request.del(path)
    return this.dispatch(promise, status)
  }

  getById (path, id, status, berrCode) {
    id = id._id || id // to simplify passing in entities without repeating the '._id'
    const promise = this.get(`${path}/${id}`, null, status)

    return promise.then(res => {
      const body = res.body
      if (_.includes([200, 304], res.status)) {
        expect(body).to.be.ok()
        expect(body).to.have.id(id)
      }
      return body
    })
  }
}

// module exported interface
module.exports = _.once(target => {
  // instantiate clients
  const request = supertest(target)
  return {
    custom (prefix, token) {
      return new Client(request, prefix, token)
    }
  }
})
