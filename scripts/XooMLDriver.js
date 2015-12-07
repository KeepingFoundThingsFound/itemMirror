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
      throw new Error('Missing client interface in options!');
    }

    // The parent URI tells us what 'folder', the XooML should be put inside
    // of. Root is a special URI for google drive, otherwise it should be an
    // id
    this._parentURI = options.associatedItem || 'root';

    // Client Interface is whatever object that a given client hands back
    // after the authorization step. We use it to make sending and recieving
    // requests extremely simple.

    // Note: This does assume that the client has already been authenticated
    // If not it could lead to potential errors. gapi should be set to the
    // clientInterface
    this.clientInterface = options.clientInterface;

    // The fragmentURI is the id of the XooML file. It may or may not exist
    this._fragmentURI = options.fragmentURI ? options.fragmentURI : null;

    // This comes from the usage of teh updated API, we have to jump through
    // several hoops to geth the authentication token that we're looking for
    var authResponse = this.clientInterface.auth2.getAuthInstance()
      .currentUser.get()
      .getAuthResponse();

    // This is the authorized header, so we can easily make requests via ajax.
    // If we get request errors, make sure that this header is correct, and
    // doesn't constantly change
    this._AUTH_HEADER = { Authorization: 'Bearer ' + authResponse.access_token };
    this._DRIVE_FILE_API = 'https://www.googleapis.com/drive/v2/files/';

    return callback(false, self);
  }


  /**
   * Creates a request for a given fileID and executes the request
   * @param  {Function} callback Function with the XML string response
   * @param {String} id ID of the file you want to get download
   */
  XooMLDriver.prototype._readFile = function(callback) {
    var self = this;

    $.ajax({
      url:  self._DRIVE_FILE_API + self._fragmentURI,
      // Required to actually initiate a download
      data: 'alt=media',
      // If this isn't specified, we get an XMLDocument back. We want a
      // string for maximum flexibility.
      dataType: 'text',
      // Note, if the authorization header is messed up, it will give us
      // an error that tells us we need to sign in and have reached our
      // limit.
      headers: self._AUTH_HEADER
    }).then(function(xml_text) {
      callback(false, xml_text);
    });
  };

  // This is a helper function that searches for the xml file in a folder when
  // necessary
  XooMLDriver.prototype._searchXooML = function(callback, folderID) {
    var self = this;

    // This query means return the file with the title XooML2.xml in the
    // root directory.
    // Details on the gapi query syntax: https://developers.google.com/drive/web/search-parameters
    var query = 'title = \'' + XooMLConfig.xooMLFragmentFileName + '\' and \'' + folderID + '\' in parents';
    var request = this.clientInterface.client.drive.files.list({
      'maxResults': 10,
      'q': query
    });
    request.execute(function(resp) {
      // Now that we've made the request, we can extract the fileID and
      // read the file contents
      var xoomlItem = resp.items[0];

      if (resp.items.length > 1) {
        console.warn('Mutliple XooML files found, only using first one. Please delete extras');
        console.log(resp.items);
      }

      // This means that there currently is no XooML file
      if (!xoomlItem) {
        // This error should be standardized somewhere and made into a number
        // that way all drivers can  share it
        return callback('XooML Not Found'); 
      }

      self._fragmentURI = xoomlItem.id;
      self._readFile(callback);
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

    // If we don't have the fragmentURI, we need this for searching
    if (!this._fragmentURI) {
      console.log('SEARCH CASE');
      return this._searchXooML(callback, this._parentURI);
    } else {
      // General case, where we don't need to do a query
      console.log('GENERAL CASE');
      this._readFile(callback, this._fragmentURI);
    }
  };

  /**
   * Writes a XooML fragment
   * @method setXooMLFragment
   * @param {String} xmlString the content of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
  XooMLDriver.prototype.setXooMLFragment = function (xmlString, callback) {
    var self = this;
    var mimeType = 'text/xml';

    // Used when updating an already existing XooML.xml
    function updateFile(callback) {
      var request = gapi.client.request({
        path: '/upload/drive/v2/files/' + self._fragmentURI,
        method: 'PUT',
        params: {'uploadType': 'media'},
        body: xmlString
      });

      request.execute(function(response) {
        callback(false);
      }, function(error) {
        console.error(error);
        callback(error);
      });
    }

    // Used when writing a new XooML file
    function insertFile(fileData, callback) {
      var boundary = '-------314159265358979323846';
      var delimiter = "\r\n--" + boundary + "\r\n";
      var close_delim = "\r\n--" + boundary + "--";

      var reader = new FileReader();
      reader.readAsBinaryString(fileData);
      reader.onload = function(e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
          'title': XooMLConfig.xooMLFragmentFileName,
          'mimeType': contentType,
          'parents': [self._parentURI],
        };

        console.log('XooML Metadata for writing');
        console.log(metadata);

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        request.execute(function(response) {
          // The response is the newly created file, and we set the fragment ID to that
          // so that future requests don't require additional searches
          self._fragmentURI = response.id
          callback(false);
        }, function(response) {
          callback('Could not write out XooML Fragment', response);
        });
      };
    }

    var blob = new Blob([xmlString], {type: mimeType, fileName: XooMLConfig.xooMLFragmentFileName});


    // Update or create the file depending on the circumstances
    if (self._fragmentURI) {
      updateFile(callback);
    } else {
      insertFile(blob, callback);
    }
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
    var self = this;

    // If we have the URI, first make a direct request for that
    if (this._fragmentURI) {
      // A simple get request will suffice
      $.get({
        url: _DRIVE_FILE_API + self._fragmentURI,
        headers: _AUTH_HEADER
      }).then(function() {
        callback(false);
      }).fail(function() {
        callback('XooML file: ' + self._fragmentURI + ' not found');
      });
    // In this case, we do a search for XooML in the folder
    } else {
      var query = 'title = \'' + XooMLConfig.xooMLFragmentFileName + '\' and \'' + self._parentURI + '\' in parents';
      var request = this.clientInterface.client.drive.files.list({
        'maxResults': 1,
        'q': query
      });
      request.execute(function(resp) {
        // Simply check if there were any results
        if (resp.items[0]) {
          callback(false);
        } else {
          callback('XooML file not found in directory: ' + self._parentURI);
        }
      });
    }
  };

  return XooMLDriver;
});