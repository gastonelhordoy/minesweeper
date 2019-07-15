'use strict'

const mongoose = require('mongoose')

class Facade {
  constructor (modelName) {
    if (!modelName) {
      throw new Error('Model name is required for instantiating a Facade')
    }

    this.modelName = modelName
    this.Model = mongoose.model(modelName)
  }

  init (nconf) {
    // use this so we can continue requiring facades internally and get always the same instance
    // this also allow to override method and do some initialization depending on configuration
    this.nconf = nconf
    this.errorManager = require('./error-utils').manager
  }

  async create (input) {
    // persist
    return await this.Model.create(input)
  }

  async getById (id) {
    if (!id) {
      throw this.errorManager.BadRequest('ID is mandatory')
    }

    const doc = await this.Model.findById(id).exec()
    if (!doc) {
      throw this.errorManager.NotFound('Entity not found', { data: this.modelName })
    }
    return doc
  }

  async search (conditions) {
    return await this.Model.find(conditions).exec()
  }
}

module.exports = Facade
