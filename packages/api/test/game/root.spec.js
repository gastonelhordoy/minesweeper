/* eslint-env mocha */
'use strict'

const platform = require('../utils')

describe('ROOT API', () => {
  it('should always REPLY OK', () => {
    const client = platform.clients.custom()
    return client.get('/', 200)
      .then(res => {
        platform.expect(res.body).to.have.property('result')
        platform.expect(res.body.result).to.equal('OK')
      })
  })
})
