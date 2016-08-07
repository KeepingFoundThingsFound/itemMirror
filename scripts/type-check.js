var _ = require('lodash')

module.exports = function (types, f) {
  function isValidType (t) {
    var valids = ['string', 'object', 'number', 'function', 'boolean'] 
    return _.includes(valids, t)
  }

  // Check inputs
  if (!_.every(types, isValidType)) {
    throw new Error('Invalid type provided in types array: ' + types)
  }
  if (!_.isFunction(f)) {
    throw new Error('Expected function as parameter, instead got: ' + f)
  }

  return function () {
    // Turn arguments into an actual array: since it isn't quite the same
    var args = Array.prototype.slice.call(arguments);

    // Check that the type array matches the argumements supplied
    var argTypes = _.map(args, (arg) => typeof arg)
    const matches = _.zipWith(types, argTypes, (type, arg) => type === arg)

    if (_.every(matches)) {
      // call the function with the original arguments
      return f.apply(null, args)
    }

    throw new Error('Arguments supplied to function do not match provided types:' +
                    '\n' + 'Args: ' + args +
                    '\n' + 'Types: ' + types)
  }
}
