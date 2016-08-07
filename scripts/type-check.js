var _ = require('lodash')
var lines = require('./lines')

// This is a map of validators. These are all helpfully provided by lodash
// and make it easy to check whether a type of object actually is something
const validators = {
  'string': _.isString,
  'object': _.isPlainObject,
  'array': _.isArray,
  'number': _.isNumber,
  'boolean': _.isBoolean,
  'function': _.isFunction
}

/**
 * Wraps a function with type checking properties
 * @param {[String]} types An array of types, that match with the params of the
 * function to be called. Valid strings are: 'string', 'object', 'array',
 * 'number', 'boolean', and 'function'
 * @param {Function} f The function to be wrapped
 * @returns {Function} A new function that performs the exact same as `f`, but
 * will fail if the parameters do not match the type array passed in
 *
 * @throws Error if `types` doesn't contain valid types
 * @throws Error if `f` isn't a function
 */
module.exports = function (types, f) {
  function isValidType (t) {
    return _.chain(validators)
      .keys()
      .includes(t)
      .value()
  }

  // Check inputs
  if (!_.every(types, isValidType)) {
    throw new Error(`Invalid type provided in types array: [${types}]`)
  }
  if (!_.isFunction(f)) {
    throw new Error(`Expected function as parameter, instead got: ${f}`)
  }

  return function () {
    // Turn arguments into an actual array: since it isn't quite the same
    const args = Array.prototype.slice.call(arguments)

    // Check that the type array matches the argumements supplied
    const validatorFuncs = _.map(types, (t) => validators[t])
    const matches = _.zipWith(validatorFuncs, args, (validator, arg) => validator(arg))

    if (_.every(matches)) {
      // call the function with the original arguments
      return f.apply(null, args)
    }

    throw new Error(lines(
      ['Arguments supplied to function do not match provided types:',
       `Args: [${args}]`,
       `Types: [${types}]`
      ]))
  }
}
