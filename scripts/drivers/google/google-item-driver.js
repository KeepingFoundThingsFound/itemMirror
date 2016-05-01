/**
 * An item utility interacts with the item storage and is responsible for
 * creating and deleting items. This is an implementation of item utility
 * using Dropbox as the item storage.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class ItemDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new ItemU with
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 *
 * @protected
 */

'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var Buffer = require('buffer')

var XooMLConfig = require('../../xooml-config')
var AssociationEditor = require('../../association-editor')

var FOLDER_MIMETYPE = 'application/vnd.google-apps.folder'
var GOOGLE_DRIVE_ENDPOINT = 'https://www.googleapis.com/drive/v2/files'
var GOOGLE_DRIVE_CONTENT = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart'

/**
 * Constructs a ItemDriver for reading/writing Item Storage
 *
 * @class ItemDriver
 * @constructor
 * @param {Object} options Options passed for construction
 * @param {Function} callback The function to call after completion
 */
function ItemDriver (options) {
  if (!options.authToken) {
    throw new Error('Missing Authentication Token')
  }

  this.authToken = options.authToken
  return this
}

// Helper function for creating a proper auth header
ItemDriver.prototype._makeAuthHeader = function() {
  var headers = new Headers()
  return headers.append('Authorization', 'Bearer' + this.authToken)
}

// A helper function which wraps around a request, and fills in some common
// paramters for use to use
// API REFERENCE: https://developers.google.com/drive/v2/reference/#Files
ItemDriver.prototype._gFetch = function (method, endPoint, params) {
  var headers = this._makeAuthHeader()

  var uri = encodeURI(GOOGLE_DRIVE_ENDPOINT + endPoint)

  // Two different versions, with/without the body
  var req = params
    ? fetch(uri, {
      headers: headers,
      method: method,
      body: JSON.stringify(params)
    })
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
  var self = this

  return this._gFetch('GET', '/' + fileID)
  .then(function(metadata) {
    return FOLDER_MIMETYPE === metadata.mimeType
  })
}

/**
 * Creates a grouping item at the location
 * @method createGroupingItem
 * @param {string} parentURI The ID of the folder in which this will be
 * created
 * @param {string} title The title of the folder to create 
 * @returns {Promise} A promise that resolves when the folder is created, or an
 * error if it could not be created for some reason
 */
ItemDriver.prototype.createGroupingItem = function (parentURI, title), {
  var self = this

  return this._gFetch('POST', '/' + parentURI, {
    mimeType: FOLDER_MIMETYPE,
    title: title,
    parents: [parentURI]
  }).then(function (res) {
    return res.id
  })
}

/**
 * Creates or uploads a non-grouping item at the location
 * @method createNonGroupingItem
 * @param {string} parentURI The ID of the folder that we want to file to
 * uploaded into
 * @param {string} title The name to set for the fiel
 * @param {string} contents contents to be written to the non-grouping item
 * @returns {Promise} A promise that resolves when the file has been sucessfully
 * uploaded, or if there was an error
 */
ItemDriver.prototype.createNonGroupingItem = function (parentURI, title, contents) {
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
  var close_delim = '\r\n--' + boundary + '--'

  var contentType = fileData.type || 'application/octet-stream'

  var base64Data = btoa(reader.result)
  var multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain' + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n' +
    '\r\n' +
    btoa(contents) +
    close_delim

  var headers = this._makeAuthHeader()
  headers.append('Content-Type', 'multipart/related; boundary="' + boundary + '"')
  headers.append('Content-Length', (new Buffer(multipartRequestBody)).length)

  return fetch(GOOGLE_DRIVE_CONTENT, {
    method: 'POST',
    headers: headers,
    body: multipartRequestBody
  }).then(function (res) {
    return res.json()
  })
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
ItemDriver.prototype.deleteNonGroupingItem = function (id, callback) {
  return this._deleteID(id)
}

/**
 * Lists the items under the grouping item
 * @method listItems
 * @param {String} path the path to the grouping item
 * @param {Function} callback(output) Function to be called when self function is finished with it's operation. Output is an array of AssociationEditors.
 *
 * @protected
 */
ItemDriver.prototype.listItems = function (parentURI, callback) {
  var self = this

  var query = '\'' + parentURI + '\' in ' + 'parents'
  var request = this.clientInterface.client.drive.files.list({
    'maxResults': 1000,
    'q': query
  })
  request.execute(function (resp) {
    if (resp.error) {
      return callback('Error: Bad Response / Request')
    }

    var items = resp.items.filter(function (item) {
      return item.title !== XooMLConfig.xooMLFragmentFileName
    })
      .map(function (item) {
        return new AssociationEditor({
          commonData: {
            // Change this to be the ID of the XooML.xml file eventually
            // Will need another parameter for that
            associatedXooMLFragment: null,
            associatedItem: item.id,
            associatedItemDriver: 'GoogleItemDriver',
            associatedXooMLDriver: 'GoogleXooMLDriver',
            associatedSyncDriver: 'MirrorSyncDriver',
            isGrouping: item.mimeType === self._FOLDER_MIMETYPE,
            localItem: item.id,
            displayText: item.title,
            publicURL: item.alternateLink
          }
        })
      })

    callback(false, items)
  })
}

  /**
   * Check if the item is existed
   * @method checkExisted
   * @param {String} path the path to the location that the item is located
   * @param {String} name the name of the item
   * @param {Function} callback(result) Function to be called when self function is finished with it's operation. Result is the bollean value for whether existed.
   *
   * @protected
   */
ItemDriver.prototype.checkExisted = function (path, callback) {
  var self = this
  var result

  self._dropboxClient.stat(path, function (error, stat) {
    if (error) {
      return self._showDropboxError(error, callback)
    }
    result = !(error !== null && error.status === 404) || (error === null && stat.isRemoved)

    return callback(false, result)
  })
}

module.exports = ItemDriver
