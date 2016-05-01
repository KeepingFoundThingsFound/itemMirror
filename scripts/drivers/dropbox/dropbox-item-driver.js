'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var Path = require('path')

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

  var headers = new Headers()
  headers.append('Authorization', this.authToken)

  // Body is either a JSON object OR it's a string (used for uploading)
  var body
  if (isObject(params)) {
    body = params
  } else if (isString(params)) {
    body = params
  } else {
    body = undefined
  }

  return fetch(uri, {
    method: method,
    headers: headers,
    body: body
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
  return this._dbFetch(false, 'GET', '/metadata' + path)
}

// Async
ItemDriver.prototype.isGroupingItem = function (path) {
  return this._getMetadata(path)
    .then(function (metadata) {
      return metadata.is_dir
    })
}

ItemDriver.prototype.createGroupingItem = function (parentURI, title) {
  return this._dbFetch(false, 'POST', '/fileops/create_folder', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

ItemDriver.prototype.createNonGroupingItem = function (parentURI, fileName, data) {
  var path = parentURI + '/' + fileName
  return this._dbFetch(true, 'PUT', '/files_put/auto' + path, data)
}

ItemDriver.prototype.deleteGroupingItem = function (parentURI, title) {
  return this._dbFetch(false, 'POST', '/fileops/delete', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

ItemDriver.prototype.deleteNonGroupingItem = function (parentURI, title) {
  return this._dbFetch(false, 'POST', '/fileops/delete', {
    root: 'dropbox',
    path: parentURI + '/' + title
  })
}

// Returns a structured list of items. Takes a grouping item address as input
// Async
ItemDriver.prototype.listItems = function (path) {
  return this._getMetadata(path).then(function (metadata) {
    // Return a list of AssociationEditor
    function contentsToAssoc (item) {
      // https://www.dropbox.com/developers-v1/core/docs#metadata-details
      return new AssociationEditor({
        commonData: {
          associatedXooMLFragment: null,
          associatedItem: item.path,
          associatedItemDriver: 'google',
          associatedXooMLDriver: 'google',
          associatedSyncDriver: 'sync',
          isGrouping: item.is_dir,
          localItem: item.path,
          // Gets the name of the file
          displayText: Path.basename(item.path),
          publicURL: DROPBOX_CONTENT + '/previews/auto' + item.path
        }
      })
    }

    return metadata.contents
    .filter(function (data) {
      // Don't show the XooML file!
      return Path.basename(data.path) !== XooMLConfig.xooMLFragmentFileName
    })
    .map(contentsToAssoc)
  })
}

// Returns true if given path leads to a real thing!
// Async
ItemDriver.prototype.checkExists = function (parentURI, title) {
  var headers = new Headers()
  headers.append('Authorization', this.authToken)

  return fetch(DROPBOX_API + '/metadata/auto' + parentURI + '/' + title, {
    headers: headers
    body: {
      // Don't include folder contents, we just want to check for an error
      list: false
    }
  }, function (res) {
    // IF the file doesn't exist, we get a 404 error
    return res.status !== 404
  })
}

module.exports = ItemDriver
