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
 * @param {String} options.fragmentURI The URI of fragment
 * contains the XooML
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 *
 * @protected
 */
define([
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var
    _CONSTRUCTOR_OPTIONS = {
      driverURI:   true,
      dropboxClient: true,
      fragmentURI: true
    };

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
    self._fragmentURI = options.fragmentURI;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      return callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error, client) {
        if (error) {
          return callback(XooMLExceptions.xooMLUException, null);
        }
        return callback(false, self);
      });
    }
  }

  /**
   * Reads and returns a XooML fragment
   * @method getXooMLFragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
  XooMLDriver.prototype.getXooMLFragment = function (callback) {
    var self = this;

    self._dropboxClient.readFile(self._fragmentURI, function (error, content) {
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
  XooMLDriver.prototype.setXooMLFragment = function (fragment, callback) {
    var self = this;

    self._dropboxClient.writeFile(self._fragmentURI, fragment, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      callback(false, stat);
    });

  };

  /**
   * Check if the XooML fragment exists
   * @method checkExists
   * @param {Function} callback Function to be called when
   * self function is finished with it's operation.
   *  @param {String} callback.error Dropbox error if there is one
   *  @param {Boolean} callback.result True if the fragment exists and
   *  false otherwis
   *
   * @protected
   */
  XooMLDriver.prototype.checkExists = function (callback) {
    var self = this, result;

    self._dropboxClient.stat(self._fragmentURI, function (error, stat) {
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

  XooMLDriver.prototype._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  XooMLDriver.prototype._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return XooMLDriver;
});





