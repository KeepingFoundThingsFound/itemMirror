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
define([
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil",
  "./AssociationEditor"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  AssociationEditor) {
  "use strict";

  var
  // private static variables
    _CONSTRUCTOR__OPTIONS = {
      driverURI: true,
      dropboxClient: true
    },
    _DIRECTORY_STAT = "inode/directory",

  //oop helper
    self;

  /**
   * Constructs a ItemDriver for reading/writing Item Storage
   *
   * @protected
   */
  function ItemDriver(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.isFunction(callback)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR__OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    var self = this;

    // private variables
    self._dropboxClient = options.dropboxClient;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error) {
        if (error) {
          return callback(XooMLExceptions.itemUException, null);
        }
        return callback(false, self);
      });
    }
  }

  self = ItemDriver.prototype;

  // callback(false) on success
  self.moveGroupingItem = function (fromPath, newPath, callback) {
    var self = this;

    self._dropboxClient.move(fromPath, newPath, function (error, stat) {
      if (error) {
        return callback(error);
      }

      return callback(false);
    });
  };

  self.isGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.stat(path, function (error,stat){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat.mimeType === _DIRECTORY_STAT);
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
  self.createGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.mkdir(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
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
  self.createNonGroupingItem = function (path, file, callback) {
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
  self.deleteGroupingItem = function (path, callback) {
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
  self.deleteNonGroupingItem = function (path, callback) {
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
  self.moveItem = function (fromPath, toPath, callback) {
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
  self.getURL = function (path, callback){
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
  self.listItems = function (path, callback) {
    var self = this;

    self._dropboxClient.readdir(path, function (error, list, stat, listStat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      var i, output;

      output = [];

      for (i = 0; i < listStat.length; i += 1) {
        if (listStat[i].name !== XooMLConfig.xooMLFragmentFileName) {
          output.push(new AssociationEditor({
            commonData: { displayText: listStat[i].name,
                          isGrouping: listStat[i].isFolder,
                          localItem: listStat[i].name,
                          associatedItem: listStat[i].isFolder ? listStat[i].path : null
                        }
          }));
        }
      }
      return callback(false, output);
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
  self.checkExisted = function(path, callback){
    var self = this, result;

    self._dropboxClient.stat(path, function (error,stat){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      result = !(error !== null && error.status === 404) || (error === null && stat.isRemoved);

      return callback(false, result);
    });
  };

  self._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  self._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return ItemDriver;
});
