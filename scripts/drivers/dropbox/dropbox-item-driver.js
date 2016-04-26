'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var XooMLConfig = require('../../xooml-config')
var AssociationEditor = require('../../association-editor')

var DROPBOX_API = 'https://api.dropboxapi.com/1'
var DROPBOX_CONTENT = 'https://content.dropboxapi.com/1'

/**
 * Provides a wrapper that allows us to interact with dropbox using a standard
 * set of methods, that also transfer across other services. Requires the
 * 'dropbox' service to be authenticated first, or it will throw an error.
 *
 * @class ItemDriver
 * @param {Object} options
 * @param {string} options.authToken This string is the authorization token that
 * we get from the auth flow. It's needed to make any request.
 * @constructor
 */
function ItemDriver (options) {
  this.authToken = options.authToken
  if !(this.authToken) {
    throw new Error('Missing Authentication Token')
  }

}

// Helper function that makes it easier to hit the dropbox API
// Returns a promise
ItemDriver.prototype._dbFetch = function (isContent, endPoint) {
  var uri = isContent
    ? DROPBOX_CONTENT + endPoint
    : DROPBOX_API + endPoint

  var headers = new Headers();
  headers.append('Authorization', this.authToken)

  return fetch(uri, {
    method: 'GET',
    headers: headers
  })
} 

module.exports = ItemDriver
