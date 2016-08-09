const _ = require('lodash')

/**
 * Joins array of strings together with newlines
 * @private
 * @static
 * @method lines
 * @param {[String]} lines The lines to join
 * @returns {String} The joined string
 */
module.exports = function (lines) {
  return _.join(lines, '\n')
}
