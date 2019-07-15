'use strict'

const _ = require('lodash')

const ENTITY_ASSERTIONS = {
}

const OBJECT_ASSERTIONS = {
  matchGame: ['rows', 'cols', 'status', 'mines']
}

function buildEntityAssertion (chai, utils, name, properties, verifyId) {
  return function entityAssertion (expected) {
    const actual = this._obj
    const assert = chai.assert

    // verify structure
    assert.isOk(actual)
    if (verifyId) {
      assert.property(actual, '_id')
    }

    // verify properties
    _.each(properties, property => {
      const prop = !_.isString(property) ? property : { p: property, o: 'equal' }
      const expectedValue = _.get(expected, prop.p)
      if (_.isUndefined(expectedValue) && prop.undef) {
        return
      }
      const actualValue = _.get(actual, prop.p)

      if (prop.arg) {
        assert[prop.o](actualValue, expectedValue, prop.arg, `${name}.${prop.p} doesn't match`)
      } else {
        assert[prop.o](expectedValue, actualValue, `${name}.${prop.p} doesn't match`)
      }
    })
  }
}

module.exports = function (chai, utils) {
  const assert = chai.assert
  const Assertion = chai.Assertion

  function initComplexAssertions (assertionsMap, verifyId) {
    _.each(assertionsMap, (properties, name) => {
      assert[name] = function entityAssert (actual, expected, msg) {
        new Assertion(actual, msg).to[name](expected)
      }
      Assertion.addMethod(name, buildEntityAssertion(chai, utils, name, properties, verifyId))
    })
  }

  initComplexAssertions(ENTITY_ASSERTIONS, true)
  initComplexAssertions(OBJECT_ASSERTIONS)

  // extend chaid
  assert.hasId = function hasId (actual, expected, msg) {
    new Assertion(actual, msg).to.have.id(expected)
  }
  assert.sameId = function sameIdAssert (actual, expected, msg) {
    new Assertion(actual, msg).to.have.same.id(expected)
  }
  assert.sameIds = function sameIdsAssert (actual, expected, msg) {
    new Assertion(actual, msg).to.have.same.unordered.ids(expected)
  }
}
