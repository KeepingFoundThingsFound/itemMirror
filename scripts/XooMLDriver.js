/**
 * An XooML utility interacts with an storage and is responsible for
 * reading and writing XooML fragments. This is an implementation of XooML utility
 * using Dropbox as the storage.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new XooMLU with
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 *
 * @protected
 */
define([
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var
    _CONSTRUCTOR_OPTIONS = {
      driverURI:   true,
      dropboxClient: true
    },
    self;

  /**
   * Constructs a XooMLDriver for reading/writing XooML fragment.
   *
   * @protected
   */
  function XooMLDriver(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this;

    self._dropboxClient = options.dropboxClient;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      return callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error, client) {
        if (error) {
          return callback(XooMLExceptions.xooMLUException, null)
        }
        return callback(false, self);
      });
    }
  }
  self = XooMLDriver.prototype;

  /**
   * Reads and returns a XooML fragment
   * @method getXooMLFragment
   * @param {String} uri the location of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
  self.getXooMLFragment = function (uri, callback) {
    var self = this;

    self._dropboxClient.readFile(uri, function (error, content) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      callback(false, content);
    });
  };

  /**
   * Writes a XooML fragment
   * @method setXooMLFragment
   * @param {String} uri the location of the XooML fragment
   * @param {String} fragment the content of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
  self.setXooMLFragment = function (uri, fragment, callback) {
    var self = this;

    self._dropboxClient.writeFile(uri, fragment, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      callback(false, stat);
    });

  };

  /**
   * Check if the XooML fragment is existed
   * @method checkExisted
   * @param {String} uri the location of the XooML fragment
   * @param {Function} callback(result) Function to be called when self function is finished with it's operation. Result is the bollean value for whether existed.
   *
   * @protected
   */
  self.checkExisted = function (uri, callback) {
    var self = this, result;

    self._dropboxClient.stat(uri, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      if ((error !== null && error.status === 404) || (error === null && stat.isRemoved === true)) {
        result = false;
      } else {
        result = true;
      }

      callback(false, result);
    });
  };

  self._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  self._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return XooMLDriver;
});





