/**
 * Dropbox Auth Driver
 *
 * Provides functionality to extract token information from a response, and also
 * build a proper URI to initiate. This adds all of the proper scopes to the
 * request so that it doesn't fail.
 */

var SERVICE_NAME = 'dropbox'

// Parses the hash, for the token, or an error and handles both cases
function extractToken (hash) {
  var token = hash.match('access_token=([^&]+)')
  var error = hash.match('error=([^&]+)')
  if (error) {
    // This indicates an error, we have to set this string in localstorage
    // TODO: Instead place error in a dedicated namespace
    return 'false'
  }

  return token[1]
}

/**
 * Returns a request URL that we can use to begin the authentication flow
 * Information on how to construct this URI comes from [Google's
 * Documentation](https://developers.google.com/identity/protocols/OAuth2UserAgent#formingtheurl)
 *
 * @method createURI
 * @private
 * @param {string} id The client_id of the application registered with Google
 * @returns {string} Returns a URI that can be used to start the authentication
 * flow. This value should get tied to an event handler that is initiated by the
 * user (by clicking on it).
 */
function createURI (id) {
  var redirect_uri = location.origin
  var endpoint = 'https://www.dropbox.com/1/oauth2/authorize?'

  return endpoint +
    'redirect_uri=' + encodeURIComponent(redirect_uri) + '&' +
    'response_type=token&' +
    'client_id=' + encodeURIComponent(id) + '&' +
    // Because we can't rely on the path, we use the state param to store the service
    'state=' + SERVICE_NAME
}

module.exports = {
  createURI: createURI,
  extractToken: extractToken,
  SERVICE_NAME: SERVICE_NAME
}
