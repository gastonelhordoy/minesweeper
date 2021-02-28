'use strict'

const Ajv = require('ajv')

const ROWS_LIMITS = {
  min: 5,
  max: 50
}
const COLS_LIMITS = {
  min: 5,
  max: 50
}

const SCHEMA = {
  type: 'object',
  properties: {
    rows: { type: 'number', minimum: ROWS_LIMITS.min, maximum: ROWS_LIMITS.max },
    cols: { type: 'number', minimum: COLS_LIMITS.min, maximum: COLS_LIMITS.max },
    mines: { type: 'number', minimum: 1 }
  },
  required: ['rows', 'cols', 'mines']
  // additionalProperties: false
}

function validate (schema, data) {
  const ajv = new Ajv({ allErrors: true })
  const valid = ajv.validate(schema, data)
  return !valid ? ajv.errors : undefined
}

console.log(validate(SCHEMA, { rows: 3, cols: 6, foo: 5 }))
