var localStoragePrelude = require('./constants').localStoragePrelude

function getKey (service) {
  return localStoragePrelude + service
}

function isAuthenticated (service) {
  // If there's a value, assume we're authenticated
  return !!(localStorage.getItem(getKey(service)))
}

function getToken (service) {
  return localStorage.getItem(getKey(service))
}

/**
 * @private
 * @static
 * @method authenticate
 * @param {string} service The service that is getting authenticated
 * @param {string} uri The URI that is used to start the initial auth flow. This
 * should come from an authorization driver that can intelligently create a URI.
 * @param {Function} callback Callback for completion of the authentication
 * process
 * @param {boolean} force (Optional) whether we should ignore a token that's
 * already in localStorage. Might be needed if we need to refresh credentials
 * @returns {Function} Returns a handler that should be attached to a UI element
 * and allows the user to initiate the authentication process. Has an additional
 * side effect of creating an event listener and binding it to the window so
 * that the callback passed in is executed after the auth flow.
 */
function authenticate (service, uri, force, callback) {
  // First check if we're already authenticated
  if (!force && isAuthenticated(service)) {
    return callback(false)
  }

  // Make an event handler that we pass back
  var handler = function () {
    window.open(uri)
  }

  // Bind an event to the DOM for handling completion
  window.addEventListener('storage', function (evt) {
    if (evt.key === getKey(service)) {
      // This means authentication somehow went wrong
      if (evt.newValue === 'false') { // It's a string because localStorage ONLY allows strings
        return callback(new Error('Authentication Failed'))
      }

      callback(false)
    }
  })

  return handler
}

module.exports = {
  // Returns whether we're authenticated for the service
  isAuthenticated: isAuthenticated,
  // Performs the authentication process
  authenticate: authenticate,
  // Passes the actual token
  getToken: getToken
}
