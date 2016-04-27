'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')


var isObject = require('lodash/isObject')
var isString = require('lodash/isString')

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
  if (!this.authToken) {
    throw new Error('Missing Authentication Token')
  }

}

// Helper function that makes it easier to hit the dropbox API
// Returns a promise
ItemDriver.prototype._dbFetch = function (isContent, method, endPoint, params) {
  var uri = isContent
    ? DROPBOX_CONTENT + endPoint
    : DROPBOX_API + endPoint

  var headers = new Headers();
  headers.append('Authorization', this.authToken)

  return fetch(uri, {
    method: method,
    headers: headers,
    body: isObject(params)
      ? JSON.stringify(params)
      // Not params, actually body
        : isString(params)
        ? params : undefined
      params ? JSON.stringify(params) : null
  }).then(function (res) {
    if (res.status > 400) {
      // This means the request was bad
      throw new Error('API Response Error')
    }
    // Assumes that the response is JSON, this should be the case
    return res.json()
  })
} 

// Gets the metadata for a file or folder
ItemDriver.prototype._getMetadata = function (path) {
  return this._dbFetch(false, 'GET', '/metadata/' + path)
}

// Async
ItemDriver.prototype.isGroupingItem = function (path) {
  return this._getMetadata(path)
    .then(function (metadata) {
      return metadata.is_dir
    })
}

ItemDriver.prototype.createGroupingItem = function (parentURI, title, callback) {
  return this._dbFetch(false, 'POST', '/fileops/create_folder', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

ItemDriver.prototype.createNonGroupingItem = function (parentURI, fileName, data, callback) {
  var path = parentURI + '/' + filename
  return this._dbFetch(true, 'PUT', '/files_put/auto' + path)
}

ItemDriver.prototype.deleteGroupingItem = function (parentURI, title, callback) {
  return this._dbFetch(false, 'POST', '/fileops/delete', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

ItemDriver.prototype.deleteNonGroupingItem = function (parentURI, title, callback) {
  return this._dbFetch(false, 'POST', '/fileops/delete', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

module.exports = ItemDriver
