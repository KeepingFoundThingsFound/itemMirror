'use strict'

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var writeFile = require('google-item-driver').writeFile
var checkExists = require('google-item-driver').checkExists

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
    return xooml // Returns undefined if there is no XooML
  })
}

/**
 * Reads and returns a XooML fragment
 * @method getXooMLFragment
 * @returns {Promise} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
 */
XooMLDriver.prototype.getXooMLFragment = function () {
  // General case, where we don't need to do a query
  if (this.fragmentURI) {
    return this._readFile(this.fragmentURI)
  // If we don't have the fragmentURI, we need this for searching
  } else {
    return this._searchXooML(this.parentURI)
  }
}

/**
 * Writes a XooML fragment
 * @method setXooMLFragment
 * @param {string} xmlString the content of the XooML fragment
 * @returns {Promise} Returns a promise that resolves when the file has been
 * written, along with the response from google
 */
XooMLDriver.prototype.setXooMLFragment = function (xmlString) {
  // Used when writing a new XooML file
  function updateFile () {
    var uri = GOOGLE_DRIVE_CONTENT + '/' + this.fragmentURI
    var qs = paramsToQueryString({
      uploadType: 'media'
    })

    return fetch(uri + qs, {
      headers: this._makeAuthHeader,
      method: 'PUT',
      body: xmlString
    }).then(function (res) {
      if (res.status >= 400) {
        throw new Error('Google API Error: Returned status code ' + res.status)
      }

      return res.json()
    })
  }

  return self.fragmentURI
    ? updateFile()
    : writeFile(this.parentURI, XooMLConfig.xooMLFragmentFileName, xmlString, this._makeAuthHeader)
}

/**
 * Check if the XooML fragment exists
 * @method checkExists
 */
XooMLDriver.prototype.checkExists = function () {
  // If we have the URI, first make a direct request for that
  return this.fragmentURI
    ? checkExists(this.fragmentURI).then(function (exists) {
      return exists
    })
    // Otherwise do a search
    : this._searchXooML(this.parentURI).then(function (xooml) {
      return !!xooml
    })
}

module.exports = { driver: XooMLDriver }
