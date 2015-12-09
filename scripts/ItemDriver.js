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

var XooMLConfig = require('./XooMLConfig');
var AssociationEditor = require('./AssociationEditor');

  /**
   * Constructs a ItemDriver for reading/writing Item Storage
   *
   * @method ItemDriver
   *
   * @param {Object} options Options passed for construction
   * @param {Function} callback The function to call after completion
   *
   * @protected
   */
  function ItemDriver(options, callback) {
    var self = this;

    // client (google drive in this case)
    if (!options.clientInterface) {
      throw new Error('Client parameter missing');
    }
    this.clientInterface = options.clientInterface;

    var authResponse = this.clientInterface.auth2.getAuthInstance()
      .currentUser.get()
      .getAuthResponse();

    // These are the same across multple files, and so should be put in a common configuration somewhere
    this._AUTH_HEADER = { Authorization: 'Bearer ' + authResponse.access_token };
    this._DRIVE_FILE_API = 'https://www.googleapis.com/drive/v2/files/';

    self._FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';

    return callback(false, self);
  }

  ItemDriver.prototype.isGroupingItem = function (id, callback) {
    var self = this;

    // do a simple get request, and see if it's a folder
    $.get({
      url: self._DRIVE_FILE_API + id,
      headers: self._AUTH_HEADER
    }).then(function(resp) {
      // This is the specific mimetype that google counts as a 'folder'
      callback(false, self._FOLDER_MIMETYPE === resp.mimeType);
    }).fail(function() {
      callback('No response from GET: ' + id);
    });
  };

  /**
   * Creates a grouping item at the location
   * @method createGroupingItem
   * @param {String} path the path to the location that the grouping item will be created
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  ItemDriver.prototype.createGroupingItem = function (parentURI, title, callback) {
    var self = this;

    $.post({
      url: self._DRIVE_FILE_API,
      headers: self._AUTH_HEADER,
      body: {
        mimeType: self._FOLDER_MIMETYPE,
        title: title,
        parents: [parentURI]
      }
    }).then(function(resp) {
      // Callback with ID of the newly created folder so we have a reference
      callback(false, resp.id);
    }).fail(function() {
      callback('Failed to make POST request for new grouping item. Check network requests for more deatils');
    });
  };

  /**
   * Creates or uploads a non-grouping item at the location
   * @method createNonGroupingItem
   * @param {String} path the path to the location that the non-grouping item will be created
   * @param {String} file the contents to be written to the non-grouping item
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  ItemDriver.prototype.createNonGroupingItem = function (path, file, callback) {
    var self = this;

    self._dropboxClient.writeFile(path, file, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };

  /**
   * Deletes a grouping item at the location
   * @method deleteGroupingItem
   * @param {String} path the path to the location that the grouping item is located
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  ItemDriver.prototype.deleteGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.remove(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };

  /**
   * Deletes a non-grouping item at the location
   * @method deleteNonGroupingItem
   * @param {String} path the path to the location that the non-grouping item is located
   * @param {String} name the name of the non-grouping item
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  ItemDriver.prototype.deleteNonGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.remove(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };
  
    /**
   * Copies an item in the fashion of moveItem
   * @method copyItem
   * @param {String} fromPath the path to the file you want copied
   * @param {String} toPath the GroupingItem path you want the fromPath file copied to
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  self.copyItem = function (fromPath, toPath, callback) {
    var self = this;
    
    self._dropboxClient.copy(fromPath, toPath, function(error){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false);
    });
  };
  
  /**
   * Moves an item
   * @method moveItem
   * @param {String} fromPath the path to the file you want moved
   * @param {String} toPath the GroupingItem path you want the fromPath file moved
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
   */
  ItemDriver.prototype.moveItem = function (fromPath, toPath, callback) {
    var self = this;
    
    self._dropboxClient.move(fromPath, toPath, function(error){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false);
    });
  };

  /**
   * Get publicly readable download url for a non-grouping item from Dropbox website.
   * @method getURL
   * @param {String} path the path to the location that the non-grouping item is located
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   *
   * @protected
  */
  ItemDriver.prototype.getURL = function (path, callback){
    var self = this;
    
    self._dropboxClient.makeUrl(path, null, function (error, publicURL){
        if (error) {
          return self._showDropboxError(error, callback);
        }
         return callback(false, publicURL.url);
    });
  };

  /**
   * Lists the items under the grouping item
   * @method listItems
   * @param {String} path the path to the grouping item
   * @param {Function} callback(output) Function to be called when self function is finished with it's operation. Output is an array of AssociationEditors.
   *
   * @protected
   */
  ItemDriver.prototype.listItems = function (parentURI, callback) {
    var self = this;

    var query = '\'' + parentURI + '\' in ' + 'parents';
    var request = this.clientInterface.client.drive.files.list({
      'maxResults': 1000,
      'q': query
    });
    request.execute(function(resp) {
      if (resp.error) {
        return callback('Error: Bad Response / Request');  
      }

      var items = resp.items.filter(function(item) {
        return item.title !== XooMLConfig.xooMLFragmentFileName;
      })
      .map(function(item) {
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
            displayText: item.title
          }
        });
      });

      callback(false, items);
    });
  };

  /**
   * Check if the item is existed
   * @method checkExisted
   * @param {String} path the path to the location that the item is located
   * @param {String} name the name of the item
   * @param {Function} callback(result) Function to be called when self function is finished with it's operation. Result is the bollean value for whether existed.
   *
   * @protected
   */
  ItemDriver.prototype.checkExisted = function(path, callback){
    var self = this, result;

    self._dropboxClient.stat(path, function (error,stat){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      result = !(error !== null && error.status === 404) || (error === null && stat.isRemoved);

      return callback(false, result);
    });
  };

module.exports = ItemDriver;