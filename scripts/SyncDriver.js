/**
 * A collection of methods that are used to synchronize XooML
 * fragments across storage platforms. Synchronization may create or
 * delete associations depending on the situation
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class SyncDriver
 *
 * @constructor
 * @param {Object} itemMirror The itemMirror object which you wish to
 * synchronize
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

  var self;

  function SyncDriver(itemMirror) {
    var self = this;

    self._itemMirror = itemMirror;
    self._fragmentDriver = itemMirror._fragmentDriver;
    self._itemDriver = itemMirror._itemDriver;
  }
  self = SyncDriver.prototype;


  /**
   * Synchonizes the itemMirror object.
   *
   * @method sync
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * 
   * @protected
   */
  self.sync = function (callback) {
    var self = this, compXooML, compItem, compXooMLLocalItem = [];

    //Loading compXL
    self._fragmentDriver.listAssociations(function (error, list){
      if (error) {
        return callback(error);
      }
      compXooML = list;
      //Load compItem
      self._itemMirror.getGroupingItemURI(function (error, groupingItemURI) {
        if (error) {
          return callback(error);
        }

        self._itemDriver.listItems(groupingItemURI, function (error,list){
          if (error) {
            return callback(error);
          }
          compItem = list;

          //Load compXooMLLocalItem
          self._getLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
        });
      });
    });
  };

  /**
   * A recursive method which removes non local items that it finds in
   * the associations until all of them are processed.
   *
   * @method _getLocalItems
   *
   * @param {String} compXooML Array of association GUIDs
   * @param {String} compItem Array of XooML associations
   * @param {String} compXooMLLocaLItem Array of XooML associations
   * recursively generated
   * @param {Number} i index
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *
   * @private
   */
  self._getLocalItems = function (compXooML, compItem, compXooMLLocalItem, i, callback){
    var self = this;

    if(compXooML.length === 0)
      self._removeNonLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
    else {
      self._itemMirror.getAssociationLocalItem(compXooML[i],function(error,item){
        if (error) {
          return callback(error);
        }
        compXooMLLocalItem.push(item);
        i++;
        if(i < compXooML.length) {
          self._getLocalItems(compXooML, compItem, compXooMLLocalItem, i, callback);
        }
        else{
          self._removeNonLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
        }
      });
    }
  };

  /**
   * Contrary to the name, this function will both remove AND create
   * local items depending on the situation.
   *
   * @method _removeNonLocalItems
   *
   * @param {String} compXooML Array of association GUIDs
   * @param {String} compItem Array of XooML associations
   * @param {String} compXooMLLocaLItem Array of XooML associations
   * recursively generated
   * @param {Number} i index
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *
   * @private
   */
  self._removeNonLocalItems = function (compXooML, compItem, compXooMLLocalItem, i, callback) {
    var self = this;

    if (compXooMLLocalItem[i] !== undefined && compXooMLLocalItem[i] !== null && compXooMLLocalItem[i] !== "") {
      var found = 0;

      for (var j = 0; j < compItem.length; j++) {
        if (compXooMLLocalItem[i] === compItem[j].getDisplayText()) {
          compItem.splice(j, 1);
          found = 1;
          break;
        }
      }

      //Remove Not-existing
      if (found === 0) {
        console.log("Sync Remove: " + compXooMLLocalItem[i]);
        self._fragmentDriver.deleteAssociation(compXooML[i],function(error){
          if (error) {
            return callback(error);
          }
          i++;
          if(i < compXooMLLocalItem.length) {
            self._removeNonLocalItems(compXooML, compItem, compXooMLLocalItem, i, callback);
          }
          else{
            self._createNewLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
          }
        });
      }
      else{
        i++;
        if(i < compXooMLLocalItem.length) {
          self._removeNonLocalItems(compXooML, compItem, compXooMLLocalItem, i, callback);
        }
        else{
          self._createNewLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
        }
      }
    }
    else {
      i++;
      if(i < compXooMLLocalItem.length) {
        self._removeNonLocalItems(compXooML, compItem, compXooMLLocalItem, i, callback);
      }
      else{
        self._createNewLocalItems(compXooML, compItem, compXooMLLocalItem, 0, callback);
      }
    }
  };

  /**
   * Creates new associations and saves those new associations. Also a
   * recursive function.
   *
   * @method _createNewLocalItems
   *
   * @param {String} compXooML Array of association GUIDs
   * @param {String} compItem Array of XooML associations
   * @param {String} compXooMLLocaLItem Array of XooML associations
   * recursively generated
   * @param {Number} i index
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *
   * @private
   */
  self._createNewLocalItems = function (compXooML, compItem, compXooMLLocalItem, i, callback){
    var self = this;

    if (compItem.length === 0) {
      self._itemMirror._save(callback);
    } else {
      //Add New
      console.log("Sync Create: " + compItem[i].getDisplayText());
      self._fragmentDriver.createAssociation({
        "displayText":    compItem[i].getDisplayText(),
        "isGroupingItem": compItem[i].getIsGroupingItem(),
        //TODO: Temporary use associated item
        "itemName":       compItem[i].getDisplayText()
      },function(error,GUID){
        if (error) {
          return callback(error);
        }
        i++;
        if(i < compItem.length) {
          self._createNewLocalItems(compXooML, compItem, compXooMLLocalItem, i, callback);
        }
        else{
          self._itemMirror._save(callback);
        }
      });
    }
  };

  return SyncDriver;
});
