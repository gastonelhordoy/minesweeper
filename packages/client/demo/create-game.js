'use strict'

const Client = require('../index')

const client = new Client({
  protocol: 'http',
  host: 'localhost:5001'
})

client.games.create(10, 10, 5).then(game => {
  console.log(JSON.stringify(game))
})
