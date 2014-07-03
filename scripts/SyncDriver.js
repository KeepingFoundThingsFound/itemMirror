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
