'use strict'

const Resource = require('../libraries/resource')

class Games extends Resource {
  constructor (http, token) {
    super(http, 'games', token)
  }

  create (rows, cols, mines) {
    return super.create({ rows, cols, mines })
  }

  markCell (id, row, col, type) {
    return this.http.post({
      path: `/${this.collection}/${id}/board/${row}/${col}/mark`,
      token: this.token,
      json: { type }
    })
  }

  unmarkCell (id, row, col) {
    return this.http.delete({
      path: `/${this.collection}/${id}/board/${row}/${col}/mark`,
      token: this.token
    })
  }

  revealCell (id, row, col) {
    return this.http.post({
      path: `/${this.collection}/${id}/board/${row}/${col}/reveal`,
      token: this.token,
      json: {}
    })
  }
}

module.exports = Games
