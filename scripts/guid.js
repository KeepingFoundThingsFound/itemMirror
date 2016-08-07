const uuid = require('uuid')
const _ = require('lodash')

module.exports = {
  /**
   * Creates a new V4 UUID
   * @returns {String} The new UUID
   */
  'generate': uuid.v4,

  /**
   * Wraps a function with GUID validation, so that one of the specified
   * paramters must always be a valid parameter
   * @param {Number} paramIdx The parameter of f that should be checked
   * @param {Function} f The function to be wrapped
   * @returns {Function} A new function that behaves the same as `f`, but will
   * throw an error if GUID is invalid
   *
   * @throws Error If the `paramIdx` in a non-positive integer
   * @throws Error if `f` isn't a function
   */
  'validate': function validateGUID (paramIdx, f) {
    if (!(_.isSafeInteger(paramIdx) && paramIdx >= 0)) {
      throw new Error(`Parameter paramIdx cannot be negative, or non-integer value: ${paramIdx}`)
    }

    if (!_.isFunction(f)) {
      throw new Error(`Parameter f must be a function: ${f}`)
    }

    return function () {
      function isValid (guid) {
        return /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(guid)
      }

      const args = Array.prototype.slice.call(arguments)

      const guidArg = args[paramIdx]
      if (isValid(guidArg)) {
        return f.apply(null, args)
      }

      throw new Error(`Expected argument to be valid GUID: ${guidArg}`)
    }
  }
}
