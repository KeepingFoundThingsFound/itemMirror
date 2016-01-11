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

var XooMLConfig = require('./XooMLConfig');
  /**
   * Constructs a XooMLDriver for reading/writing XooML fragment.
   *
   * @method XooMLDriver
   *
   * @param {Object} options A list of options for construction
   * @param {Function} callback A function to call after completion
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
    // To avoid confusion, we should remove the above and any references to
    // it. It makes the code way easier to read
    this.gapi = this.clientInterface;

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
   * @method _readFile
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
    // If we don't have the fragmentURI, we need this for searching
    if (!this._fragmentURI) {
      return this._searchXooML(callback, this._parentURI);
    } else {
      // General case, where we don't need to do a query
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
      var request = this.gapi.client.request({
        path: '/upload/drive/v2/files/' + self._fragmentURI,
        method: 'PUT',
        params: {'uploadType': 'media'},
        body: xmlString
      });

      request.execute(function() {
        callback(false);
      }, function(error) {
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
      reader.onload = function() {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
          'title': XooMLConfig.xooMLFragmentFileName,
          'mimeType': contentType,
          'parents': [{
            "kind": "drive#parentReference",
            "id": self._parentURI
          }]
        };

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

        var request = self.gapi.client.request({
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
        url: this._DRIVE_FILE_API + self._fragmentURI,
        headers: this._AUTH_HEADER
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

module.exports = XooMLDriver;