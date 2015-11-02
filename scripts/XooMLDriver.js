/**
 * An XooML utility interacts with an storage and is responsible for
 * reading and writing XooML fragments. This is an implementation of XooML utility
 * using Dropbox as the storage.
 *
 * This specific version is for google drive
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
  XooMLConfig) {
  "use strict";

  var _CONSTRUCTOR_OPTIONS = {
      // This is the location of the driver
      // Not currently used, but will eventually be specified
      driverURI: true,
      // This is the location of the fragment (XooML2.xml) for a given
      // interface. In the case of google drive it's just the first result of
      // the root folder with a search for the exact file XooML2.xml. While
      // there's a more specific ID for the file itself, we can't really
      // use that because there's no pointer to that initial file.

      // This means that if there are two XooML2.xml files in the root
      // directory, it's then possible that one will get ignored
    };

  /**
   * Constructs a XooMLDriver for reading/writing XooML fragment.
   *
   * @protected
   */
  function XooMLDriver(options, callback) {
    var self = this;

    if (!options.clientInterface) {
      throw new Error('Missing client interface in options!')
    }

    // Client Interface is whatever object that a given client hands back
    // after the authorization step. We use it to make sending and recieving
    // requests extremely simple.

    // Note: This does assume that the client has already been authenticated
    // If not it could lead to potential errors. gapi should be set to the
    // clientInterface
    this._clientInterface = options.clientInterface;

    // The fragmentURI is either a specific ID, or just 'root'
    this._fragmentURI = options.fragmentURI;

    return callback(false, self);
    }
  }


  /**
   * Creates a request for a given fileID and executes the request
   * @param  {Function} callback Function with the XML string response
   * @param {String} id ID of the file you want to get download
   */
  function _readFile = function(callback, id) {
    var self = this;

    request.execute(function(resp) {
      $.ajax({
        url: 'https://www.googleapis.com/drive/v2/files/' + id,
        // Required to actually initiate a download
        data: 'alt=media',
        // If this isn't specified, we get an XMLDocument back. We want a
        // string for maximum flexibility.
        dataType: 'text',
        // Note, if the authorization header is messed up, it will give us
        // an error that tells us we need to sign in and have reached our
        // limit.
        headers: { Authorization: 'Bearer ' + self.clientInterface.auth.getToken().access_token }
      }).then(function(xml_text) {
        callback(xml_text);
      });
    }
  }

  /**
   * In some cases, you can't get the root fragment ordinairily. Google drive
   * makes it easy to reference other XooML files when you have a pointer to
   * them, but we don't have anything to point to the root. Therefore we have
   * to have a special variation of getXooMLFragment for the root case that
   * functions differently.
   *
   * In this case, we make a query in the root folder of gdrive and return the
   * contents of the first file with the name XooML2.xml
   */
  function _getRootFragment = function (callback) {
    var self = this;

    // This query means return the file with the title XooML2.xml in the
    // root directory.
    // Details on the gapi query syntax: https://developers.google.com/drive/web/search-parameters
    var query = 'title = \'' + XooMLConfig.xooMLFragmentFileName + '\' and in root';
    var request = this.clientInterface.client.drive.files.list({
      'maxResults': 1,
      'q': query
    });
    request.execute(function(resp) {
      // Now that we've made the request, we can extract the fileID and
      // read the file contents
      var rootId = resp.items[0];

      _readFile(callback, id);
    });
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

    // Root fragment case
    if (this._fragmentURI === 'root') {
      _getRootFragment(callback);
    }

    // General case, where we don't need to do a query
    _readFile(callback, this._fragmentURI);
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

    // We manually subistitue newlines with the proper XML
    // representation for them because XMLSerializer doesn't seem to
    // be DOM compliant.
    // See: http://stackoverflow.com/questions/2004386/how-to-save-newlines-in-xml-attribute
    fragment = fragment.replace(/\n/g, "&#10;");

    self._dropboxClient.writeFile(self._fragmentURI, fragment, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
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

  return XooMLDriver;
});





