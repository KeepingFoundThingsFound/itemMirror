'use strict'

// TODO: Remove duplicate functionality into another file for hitting the API
// NOTE: Instead of reimplementing everything, why not just literally use the
// ITEMDRIVER methods?

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var Buffer = require('buffer')

var XooMLConfig = require('../../xooml-config')

var DROPBOX_API = 'https://api.dropboxapi.com/1'
var DROPBOX_CONTENT = 'https://content.dropboxapi.com/1'

function XooMLDriver (options) {
  if (!this.authToken) {
    throw new Error('Missing Authentication Token')
  }

  this.parentURI = options.parentURI
  this.fragmentURI = options.fragmentURI
    ? options.parentURI + 'XooML2.xml'
    : '/XooML2.xml' // Assume root if nothing is provided

  this.authToken = options.authToken
  this.name = 'dropbox'
  return this
}

// Helper function for creating a proper auth header
XooMLDriver.prototype._makeAuthHeader = function () {
  var headers = new Headers()
  return headers.append('Authorization', 'Bearer' + this.authToken)
}

// Returns true if given path leads to a real thing!
// Async
XooMLDriver.prototype.checkExists = function () {
  var headers = this._makeAuthHeader()

  return fetch(encodeURI(DROPBOX_API + '/metadata/auto' + this.fragmentURI + '/' + XooMLConfig.xooMLFragmentFileName), {
    headers: headers,
    body: {
      // Don't include folder contents, we just want to check for an error
      list: false
    }
  }, function (res) {
    // IF the file doesn't exist, we get a 404 error
    return res.status !== 404
  })
}

// Fetches the contents of a XooMLFragment as a string, if it exists
XooMLDriver.prototype.getXooMLFragment = function () {
  var headers = this._makeAuthHeader()

  return fetch(encodeURI(DROPBOX_CONTENT + '/files/auto' + this.fragmentURI + '/' + XooMLConfig.xooMLFragmentFileName), {
    headers: headers
  }).then(function (res) {
    if (res.status >= 400) {
      throw new Error('Dropbox API Error. Got status code: ' + res.status)
    }
    return res.text()
  })
}

// Saves the contents of a XooMLFragment to the given directory
XooMLDriver.prototype.setXooMLFragment = function (xooml) {
  var headers = this._makeAuthHeader()

  // Content length is required in bytes. We borrow node's buffers to
  // make determining this easy
  var bytes = (new Buffer(xooml)).length
  headers.append('Content-Length', bytes)

  return fetch(encodeURI(DROPBOX_CONTENT + '/files_put/auto' + this.fragmentURI + '/' + XooMLConfig.xooMLFragmentFileName), {
    headers: headers,
    method: 'PUT',
    body: xooml
  }).then(function (res) {
    if (res.status >= 400) {
      throw new Error('Dropbox API Error. Got status code: ' + res.status)
    }
  })
}

module.exports = { driver: XooMLDriver }
