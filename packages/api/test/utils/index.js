'use strict'

const _ = require('lodash')

// require chai plugins in one place
const chai = require('chai')
chai.use(require('chaid'))
chai.use(require('chai-string'))
chai.use(require('dirty-chai'))
chai.use(require('./assertions'))

// require utilities
const data = require('./data')

module.exports = _.once(() => {
  // mock mongodb
  const mongoose = require('minesweeper-core').mongoose
  const Mockgoose = require('mockgoose').Mockgoose
  const mockgoose = new Mockgoose(mongoose)

  // bootstrap platform
  return mockgoose.prepareStorage()
    .then(() => {
      return require('../../app')
    })

    .then(target => {
      const clients = require('./clients')(target)

      module.exports.clients = clients
      module.exports.data = data
      module.exports.removeModels = data.removeModels.bind(data)
      module.exports.removeMatchingModels = data.removeMatchingModels.bind(data)

      if (_.isFunction(global.run)) {
      // run mocha delayed root suite
      // https://mochajs.org/#delayed-root-suite
        global.run()
      }

      return module.exports
    })
})

module.exports.expect = chai.expect // shortcut to avoid requiring chai in every test-suite
module.exports.constants = require('minesweeper-common').constants

module.exports.randomArrayItem = function randomArrayItem (array) {
  const index = _.random(0, array.length - 1)
  return array[index]
}

module.exports.startSandbox = (...models) => {
  return () => {
    return data.startSandbox(...models)
  }
}

module.exports.endSandbox = () => {
  return data.endSandbox()
}

module.exports.initData = function initData () {
  return data.init()
}

module.exports.shutdown = function shutdown () {
  return data.shutdown()
    .then(() => {
      setTimeout(() => {
        process.exit(0)
      }, 2000)
    })
}
