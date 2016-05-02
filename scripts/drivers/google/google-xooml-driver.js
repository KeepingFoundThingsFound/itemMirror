'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var reduce = require('lodash/reduce')
var trimEnd = require('lodash/trimEnd')

var XooMLConfig = require('../../xooml-config')

// Constants
var GOOGLE_DRIVE_ENDPOINT = 'https://www.googleapis.com/drive/v2/files'
var GOOGLE_DRIVE_CONTENT = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart'

/**
 * Constructs a XooMLDriver for reading/writing XooML fragment.
 *
 * @method XooMLDriver
 *
 * @param {Object} options A list of options for construction
 * @param {string} options.authToken The authentication token for making
 * requests
 * @param {string} options.parentURI (Optional) The folder ID where the XooML will be
 * read/written from. If not provided, root is assumed.
 * @param {string} options.fragmentURI (Optinal) The file ID of the XooML File.
 * This may or may not exist.
 * @returns {XooMLDriver}
 */
function XooMLDriver (options, callback) {
  if (!options.authToken) {
    throw new Error('Missing Authentication Token')
  }
  this.authToken = options.authToken
  this.parentURI = options.parentURI || 'root'

  this.fragmentURI = options.fragmentURI ? options.fragmentURI : null

  return this
}

// Helper function for creating a proper auth header
XooMLDriver.prototype._makeAuthHeader = function () {
  var headers = new Headers()
  return headers.append('Authorization', 'Bearer' + this.authToken)
}

/**
 * Creates a request for the fragment as it is addressed in the fragmentURI
 * property
 * @method _readFile
 * @private
 * @param {string} id File id to be read
 * @returns {Promise(string)} Returns the text contents of the file
 */
XooMLDriver.prototype._readFile = function (id) {
  // alt=media option is required to initiate a download
  var uri = this.GOOGLE_DRIVE_ENDPOINT + '/' + id + '?alt=media'
  return fetch(uri, {
    headers: this.makeAuthHeader()
  }).then(function (res) {
    if (res.status >= 400) {
      throw new Error('Google Drive API Error. Recieved status code ' + res.status)
    }

    return res.text()
  })
}

// Takes params and converts them a query string that can be appended to the
// end of a URI for requests that don't support a body (like GET)
function paramsToQueryString (params) {
  var qs = reduce(params, function (acc, value, key) {
    acc + key.toString() + value.toString() + '&'
  }, '?')

  return trimEnd(qs, '&')
}

// This is a helper function that searches for the xml file in a folder when
// necessary
XooMLDriver.prototype._searchXooML = function (folderID) {
  // This query means return the file with the title XooML2.xml in the
  // root directory.
  // Details on the gapi query syntax: https://developers.google.com/drive/web/search-parameters
  var query = 'title = \'' + XooMLConfig.xooMLFragmentFileName + '\' and \'' + folderID + '\' in parents'
  var params = JSON.stringify({
    'maxResults': 10,
    'q': query
  })
  var uri = GOOGLE_DRIVE_ENDPOINT + '/files/list/' + folderID + paramsToQueryString(params)

  return fetch(uri, {
    headers: this._makeAuthHeader()
  }).then(function (res) {
    return res.json()
  }).then(function (res) {
    var xooml = res.items[0]
    if (!xooml) {
      throw new Error('XooML Not Found')
    }

    return xooml
  })
}

  /**
   * Reads and returns a XooML fragment
   * @method getXooMLFragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
XooMLDriver.prototype.getXooMLFragment = function (callback) {
    // If we don't have the fragmentURI, we need this for searching
  if (!this._fragmentURI) {
    return this._searchXooML(callback, this._parentURI)
  } else {
      // General case, where we don't need to do a query
    this._readFile(callback, this._fragmentURI)
  }
}

  /**
   * Writes a XooML fragment
   * @method setXooMLFragment
   * @param {String} xmlString the content of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
XooMLDriver.prototype.setXooMLFragment = function (xmlString, callback) {
  var self = this
  var mimeType = 'text/xml'

    // Used when updating an already existing XooML.xml
  function updateFile (callback) {
    var request = this.gapi.client.request({
      path: '/upload/drive/v2/files/' + self._fragmentURI,
      method: 'PUT',
      params: {'uploadType': 'media'},
      body: xmlString
    })

    request.execute(function () {
      callback(false)
    }, function (error) {
      callback(error)
    })
  }

    // Used when writing a new XooML file
  function insertFile (fileData, callback) {
    var boundary = '-------314159265358979323846'
    var delimiter = '\r\n--' + boundary + '\r\n'
    var close_delim = '\r\n--' + boundary + '--'

    var reader = new FileReader()
    reader.readAsBinaryString(fileData)
    reader.onload = function () {
      var contentType = fileData.type || 'application/octet-stream'
      var metadata = {
        'title': XooMLConfig.xooMLFragmentFileName,
        'mimeType': contentType,
        'parents': [{
          'kind': 'drive#parentReference',
          'id': self._parentURI
        }]
      }

      var base64Data = btoa(reader.result)
      var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim

      var request = self.gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody})
      request.execute(function (response) {
          // The response is the newly created file, and we set the fragment ID to that
          // so that future requests don't require additional searches
        self._fragmentURI = response.id
        callback(false)
      }, function (response) {
        callback('Could not write out XooML Fragment', response)
      })
    }
  }

  var blob = new Blob([xmlString], {type: mimeType, fileName: XooMLConfig.xooMLFragmentFileName})

    // Update or create the file depending on the circumstances
  if (self._fragmentURI) {
    updateFile(callback)
  } else {
    insertFile(blob, callback)
  }
}

  /**
   * Check if the XooML fragment exists
   * @method checkExists
   * @param {Function} callback Function to be called when
   * self function is finished with it's operation.
   *  @param {String} callback.error Dropbox error if there is one
   *  @param {Boolean} callback.result True if the fragment exists and
   *  false otherwise
   *
   * @protected
   */
XooMLDriver.prototype.checkExists = function (callback) {
  var self = this

    // If we have the URI, first make a direct request for that
  if (this._fragmentURI) {
    // A simple get request will suffice
    fetch(this._DRIVE_FILE_API + self._fragmentURI, {
      headers: self._AUTH_HEADER
    }).then(function () {
      callback(false)
    }).catch(function () {
      callback('XooML file: ' + self._fragmentURI + ' not found')
    })
    // In this case, we do a search for XooML in the folder
  } else {
    var query = 'title = \'' + XooMLConfig.xooMLFragmentFileName + '\' and \'' + self._parentURI + '\' in parents'
    var request = this.clientInterface.client.drive.files.list({
      'maxResults': 1,
      'q': query
    })
    request.execute(function (resp) {
        // Simply check if there were any results
      if (resp.items[0]) {
        callback(false)
      } else {
        callback('XooML file not found in directory: ' + self._parentURI)
      }
    })
  }
}

module.exports = XooMLDriver
