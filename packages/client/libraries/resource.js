'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

class Resource {
  constructor (http, collectionName, token) {
    this.http = http
    this.collection = collectionName
    this.token = token
  }

  create (body) {
    const args = arguments

    if (args.length !== 1) {
      return Promise.reject(new Error('Incorrect arguments. Should be: body'))
    }

    return this.http.post({
      path: '/' + this.collection,
      json: body,
      token: this.token
    })
  }

  update (id, body) {
    const args = arguments

    if (args.length !== 2) {
      return Promise.reject(new Error('Incorrect arguments. Should be: id, body'))
    }

    return this.http.put({
      path: `/${this.collection}/${id}`,
      json: body,
      token: this.token
    })
  }

  remove (id) {
    const args = arguments

    if (args.length !== 1) {
      return Promise.reject(new Error('Incorrect arguments. Should be: id'))
    }

    return this.http.delete({
      path: `/${this.collection}/${id}`,
      token: this.token
    })
  }

  search (conditions) {
    return this.http.get({
      path: '/' + this.collection,
      token: this.token,
      qs: conditions
    })
    .then(list => {
      if (this.parser && list && list.length) {
        _.each(list, this.parser)
      }
      return list
    })
  }

  getById () {
    const args = arguments

    if (args.length !== 1) {
      return Promise.reject(new Error('Incorrect arguments. Should be: id'))
    }

    const id = args[0]

    if (!id) {
      return Promise.reject(new Error(`Missing id for "${this.collection}" resource`))
    }

    return this.http.get({
      path: `/${this.collection}/${id}`,
      token: this.token
    })
  }
}

module.exports = Resource
