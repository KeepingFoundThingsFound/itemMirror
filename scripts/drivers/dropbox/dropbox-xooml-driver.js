'use strict'

// TODO: Remove duplicate functionality into another file for hitting the API

// Allows allows us to use the fetch API for better requests in the browser and node
require('es6-promise').polyfill()
require('isomorphic-fetch')

var isObject = require('lodash/isObject')
var isString = require('lodash/isString')

var XooMLConfig = require('../../xooml-config')

var DROPBOX_API = 'https://api.dropboxapi.com/1'
var DROPBOX_CONTENT = 'https://content.dropboxapi.com/1'

function XooMLDriver (options) {
  this.authToken = options.authToken
  if (!this.authToken) {
    throw new Error('Missing Authentication Token')
  }
}

// Helper function that makes it easier to hit the dropbox API
// Returns a promise
XooMLDriver.prototype._dbFetch = function (isContent, method, endPoint, params) {
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

// Returns true if given path leads to a real thing!
// Async
XooMLDriver.prototype.checkExists = function (parentURI, title) {
  var headers = new Headers()
  headers.append('Authorization', this.authToken)

  return fetch(DROPBOX_API + '/metadata/auto' + parentURI + '/' + title, {
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
