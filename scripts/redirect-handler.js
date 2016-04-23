/* redirect-handler.js
 *
 * This file provides functions for dealing with the redirection URI and helping
 * with the authorization process. The idea is that upon redirection, a user
 * gets sent back to the application, however the authentication token is
 * included in the URL. To access it, we pass the information via localStorage,
 * finishing the authorization callback.
 *
 */

var localStoragePrelude = require('./constants').localStoragePrelude

// Determines whether our URL is a redirect
function isRedirect () {
  // Assume that if there's a hash, it's a redirect
  return !!(location.hash)
}

// Returns the auth service that the redirect specifies
// We store that information in the state parameter when constructing the URI
function getService () {
  var match = location.hash.match('state=([a-z]+)')
  if (match) {
    return match[1]
  }
}

/**
 * @private
 * @static
 * @method redirectHandler
 * @param {Function} tokenExtractor A function that parses the info in
 * location.hash, and gets the token. Since the key for that could by any number
 * of things, we handle it on a case by case basis. It's also responsible for
 * setting the token to 'false' and triggering an error.
 */
module.exports = {
  'redirectHandler': function (tokenExtractor) {
    var token = tokenExtractor(location.hash)
    var service = getService(location.path)
    // This triggers the callback in the main application window!
    localStorage.setItem(localStoragePrelude + service, token)

    // Inform user that the process is done, and they should close the newly
    // created page
    document.write('<h1>Thanks! Please close this window</h1>')
  },
  'getService': getService,
  'isRedirect': isRedirect
}
