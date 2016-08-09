'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var reduce = require('lodash/reduce')
var trimEnd = require('lodash/trimEnd')

var Buffer = require('buffer')

var XooMLConfig = require('../../xooml-config')
var AssociationEditor = require('../../association-editor')

var FOLDER_MIMETYPE = 'application/vnd.google-apps.folder'
var GOOGLE_DRIVE_ENDPOINT = 'https://www.googleapis.com/drive/v2/files'
var GOOGLE_DRIVE_CONTENT = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart'

// Takes params and converts them a query string that can be appended to the
// end of a URI for requests that don't support a body (like GET)
function paramsToQueryString (params) {
  var qs = reduce(params, function (acc, value, key) {
    acc + key.toString() + value.toString() + '&'
  }, '?')

  return trimEnd(qs, '&')
}

/**
 * Constructs a ItemDriver for reading/writing Item Storage
 *
 * @class ItemDriver
 * @constructor
 * @param {Object} options Options passed for construction
 * @param {string} options.authToken Authentication token for authorization
 * @param {string} options.parentURI The URI of the folder controlling this
 * driver
 */
function ItemDriver (options) {
  if (!options.authToken) {
    throw new Error('Missing Authentication Token')
  }

  if (!options.pareuntURI) {
    throw new Error('Missing parentURI in options')
  }

  this.parentURI = options.parentURI
  this.authToken = options.authToken
  this.name = 'google'
  return this
}

// Helper function for creating a proper auth header
ItemDriver.prototype._makeAuthHeader = function () {
  var headers = new Headers()
  return headers.append('Authorization', 'Bearer' + this.authToken)
}

// A helper function which wraps around a request, and fills in some common
// paramters for use to use
// API REFERENCE: https://developers.google.com/drive/v2/reference/#Files
ItemDriver.prototype._gFetch = function (method, endPoint, params) {
  var headers = this._makeAuthHeader()

  var uri = encodeURI(GOOGLE_DRIVE_ENDPOINT + endPoint)

  // Three different versions
  var req = method === 'GET'
    // Special version that requires a query string
    ? fetch(uri + paramsToQueryString(params), {
      headers: headers,
      methods: method
    })
    : params
    // Params in request body
    ? fetch(uri, {
      headers: headers,
      method: method,
      body: JSON.stringify(params)
    })
    // No params at all!
    : fetch(uri, {
      headers: headers,
      method: method
    })

  return req.then(function (res) {
    if (res.status >= 400) {
      throw new Error('Google Drive API Response Error. Recieved request code ' + res.status)
    }
    // Assumes that responses will come back as JSON, which is typically the
    // case
    return res.json()
  })
}

// Async
ItemDriver.prototype.isGroupingItem = function (id) {
  return this._gFetch('GET', '/' + id)
  .then(function (metadata) {
    return FOLDER_MIMETYPE === metadata.mimeType
  })
}

/**
 * Creates a grouping item at the location
 * @method createGroupingItem
 * @param {string} title The title of the folder to create
 * @returns {Promise} A promise that resolves when the folder is created, or an
 * error if it could not be created for some reason
 */
ItemDriver.prototype.createGroupingItem = function (title) {
  return this._gFetch('POST', '/' + this.parentURI, {
    mimeType: FOLDER_MIMETYPE,
    title: title,
    parents: [this.parentURI]
  }).then(function (res) {
    return res.id
  })
}

// Does the actual complicated work of writing to a file
// TODO: Factor out into another file
function writeFile (parentURI, title, contents, authHeader) {
  var metadata = {
    'title': title,
    'mimeType': 'text/plain',
    'parents': [{
      'kind': 'drive#parentReference',
      'id': parentURI
    }]
  }

  var boundary = '-------314159265358979323846'
  var delimiter = '\r\n--' + boundary + '\r\n'
  var closeDelim = '\r\n--' + boundary + '--'

  var multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain' + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    btoa(contents) +
    closeDelim

  authHeader.append('Content-Type', 'multipart/related; boundary="' + boundary + '"')
  authHeader.append('Content-Length', (new Buffer(multipartRequestBody)).length)

  return fetch(GOOGLE_DRIVE_CONTENT, {
    method: 'POST',
    headers: authHeader,
    body: multipartRequestBody
  }).then(function (res) {
    return res.json()
  })
}

/**
 * Creates or uploads a non-grouping item at the location
 * @method createNonGroupingItem
 * @param {string} title The name to set for the fiel
 * @param {string} contents contents to be written to the non-grouping item
 * @returns {Promise} A promise that resolves when the file has been sucessfully
 * uploaded, or if there was an error
 */
ItemDriver.prototype.createNonGroupingItem = function (title, contents) {
  return writeFile(this.parentURI, title, contents, this._makeAuthHeader)
}

// Helper function for deleting files, since no distinction is needed
// between grouping items and non grouping items in google drive
ItemDriver.prototype._deleteID = function (id) {
  return this._gFetch('DELETE', '/' + id)
}

/**
 * Deletes a grouping item with the specified ID
 * @method deleteGroupingItem
 * @param {string} id the id of the file that will be deleted. This is specific to google
 * @returns {Promise} Returns promise with the actual request back
 */
ItemDriver.prototype.deleteGroupingItem = function (id) {
  return this._deleteID(id)
}

/**
 * Deletes a grouping item with the specified ID
 * @method deleteGroupingItem
 * @param {string} id the id of the file that will be deleted. This is specific to google
 * @returns {Promise} Returns promise with the actual request back
 */
ItemDriver.prototype.deleteNonGroupingItem = function (id) {
  return this._deleteID(id)
}

/**
 * Lists the items under the grouping item
 * @method listItems
 * @returns {Promise([AssociationEditor])} Returns a promise that resolves with
 * an array of association editors
 */
ItemDriver.prototype.listItems = function () {
  return this._gFetch('GET', '/list', {
    q: "'" + this.parentURI + "' in parents",
    maxResults: 1000
  }).then(function (data) {
    return data.items.filter(function (item) {
      return item.title !== XooMLConfig.xooMLFragmentFileName
    }).map(function (item) {
      return new AssociationEditor({
        commonData: {
          // Change this to be the ID of the XooML.xml file eventually
          // Will need another parameter for that
          associatedXooMLFragment: null,
          associatedItem: item.id,
          associatedItemDriver: 'google',
          associatedXooMLDriver: 'google',
          associatedSyncDriver: 'default',
          isGrouping: item.mimeType === self._FOLDER_MIMETYPE,
          localItem: item.id,
          displayText: item.title,
          publicURL: item.alternateLink
        }
      })
    })
  })
}

// High level checkExists so we don't copy code for xooml driver
function checkExists (id, authHeader) {
  // Do a get request for a file, and see if the response is a 404
  return fetch(GOOGLE_DRIVE_ENDPOINT + '/' + id, {
    headers: authHeader
  }).then(function (res) {
    if (res.status === 404) {
      return false
    } else if (res.status < 400) {
      return true
    } else {
      // This means that we made a bad request or something bad happened
      throw new Error('Google Drive API Error. Returned status code ' + res.status)
    }
  })
}

/**
 * Check if the item exists at all
 * @method checkExists
 * @param {string} id The id of the given file
 * @returns {Promise(boolean)} Returns a promise that resolves with whether the file exists or not
 */
ItemDriver.prototype.checkExists = function (id) {
  return checkExists(id, this._makeAuthHeader())
}

module.exports = {
  driver: ItemDriver,
  writeFile: writeFile,
  checkExists: checkExists,
  paramsToQueryString: paramsToQueryString
}
