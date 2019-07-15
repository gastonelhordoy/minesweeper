'use strict'

const Client = require('../index')

const client = new Client({
  protocol: 'http',
  host: 'localhost:5001'
})

client.games.search().then(games => {
  games.forEach(game => {
    console.log(JSON.stringify(game))
  })
})
