'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const faker = require('faker')
faker.locale = 'en'

const CACHE = {
  models: []
}
let SANDBOX

function trackModelInSandbox (modelName) {
  if (SANDBOX && !_.includes(SANDBOX.models, modelName)) {
    SANDBOX.models.push(modelName)
  }
  if (!_.includes(CACHE.models, modelName)) {
    CACHE.models.push(modelName)
  }
}

function copyProperties (object, doc, properties) {
  object._id = doc._id.toString()
  object.createdAt = doc.createdAt
  _.each(properties, field => {
    object[field] = doc.get(field)
  })
}

function createObjects (quantity, generator, modelName, properties) {
  const objects = _.times(quantity, generator)
  return insertObjects(objects, modelName, properties)
}

function insertObjects (objects, modelName, properties) {
  const SchemaModel = model(modelName)

  function bulkCreationHandler (models) {
    trackModelInSandbox(modelName)
    return _.each(objects, (object, index) => {
      copyProperties(object, models[index], properties)
    })
  }

  const sequentialHook = _.find(SchemaModel.schema._callQueue, qItem => {
    return qItem[0] === 'pre' && qItem[1][0] === 'save' && _.isFunction(qItem[1][2]) && qItem[1][2].name === 'sequentialIdHook'
  })

  if (sequentialHook) {
    // if sequentialId plugin is applied to the schema then use #create method that triggers save hooks
    // http://mongoosejs.com/docs/api.html#model_Model.create
    // https://github.com/Automattic/mongoose/issues/2582
    return SchemaModel.create(objects)
      .then(bulkCreationHandler)
  }

  // http://mongoosejs.com/docs/api.html#model_Model.insertMany
  // https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/
  return SchemaModel.insertMany(objects, {
    ordered: false
  })
    .then(bulkCreationHandler)
}

function mongoose () {
  return require('minesweeper-core').mongoose
}

function model (name) {
  return mongoose().model(name)
}

function removeMatchingModels (conditions, ...models) {
  if (_.isEmpty(models)) {
    throw new Error('You must provide at least one model name for removing documents')
  }
  _.each(models, name => {
    if (!_.isString(name)) {
      throw new Error('Model names must be of type String')
    }
  })

  return Promise.map(models, name => {
    const modelConditions = conditions || {}
    if (name === 'user') {
      modelConditions._id = {
        $ne: CACHE.superuser._id
      }
    }
    return model(name).deleteMany(modelConditions)
  })
}

function removeModels (...models) {
  return removeMatchingModels(undefined, ...models)
}

function startSandbox (...models) {
  SANDBOX = { models: models || [] }
  if (!_.isEmpty(models)) {
    return removeModels(...models)
  }
  return Promise.resolve()
}

function endSandbox () {
  if (!_.isEmpty(SANDBOX.models)) {
    return removeModels(...SANDBOX.models)
      .then(() => {
        SANDBOX = undefined
      })
  }
  SANDBOX = undefined
}

function save (modelName, object, properties) {
  return model(modelName).create(object)
    .then(doc => {
      trackModelInSandbox(modelName)
      copyProperties(object, doc, properties)
      return object
    })
}

function init () {
  return Promise.resolve()
}

function shutdown () {
  const promises = []
  if (CACHE.superuser) {
    promises.push(model('user').remove({ _id: CACHE.superuser._id }))
  }

  return Promise.all(promises)
    .then(() => {
      return Promise.map(CACHE.models, modelName => {
        return model(modelName).countDocuments()
      })
        .then(leftovers => {
          const printHeader = _.once(() => {
            console.log('\n############\nLEFTOVERS\n############\n')
          })
          _.each(CACHE.models, (modelName, index) => {
            if (leftovers[index] > 0) {
              printHeader()
              console.log(`${modelName}: ${leftovers[index]}`)
            }
          })
        })
    })
}

module.exports = {
  model,
  removeMatchingModels,
  removeModels,
  startSandbox,
  endSandbox,

  init,
  shutdown
}
