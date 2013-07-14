define([
  "ItemMirror",
  "../../scripts/XooMLConfig.js",
  "../../scripts/XooMLUtil.js"
], function(
  ItemMirror,
  XooMLConfig,
  XooMLUtil
){
  "use strict";

  var self,
    _DROPBOX_CLIENT,
    dropboxXooMLDriver,
    dropboxItemDriver,
    mirrorSyncDriver,
    URIToGroupingItem,
    itemMirrorOptions,
    createAssociationOptions,
    dropboxClientCredentials;

  dropboxClientCredentials = {
    key: "M8oENTuQXTA=|twOiRi5hlrfOTfNOcuMP754rbqHdCZLSsxh0c1764g=="
  };

  dropboxXooMLDriver = {
    driverURI: "DropboxXooMLUtility",
    dropboxClient: _DROPBOX_CLIENT
  };
  dropboxItemDriver = {
    driverURI: "DropboxItemUtility",
    dropboxClient: _DROPBOX_CLIENT
  };
  mirrorSyncDriver = {
    driverURI: "MirrorSyncUtility"
  };
  URIToGroupingItem = "/test";
  itemMirrorOptions = {
    1: {
      groupingItemURI: URIToGroupingItem,
      xooMLDriver: dropboxXooMLDriver,
      itemDriver: dropboxItemDriver
    },
    2: {
      groupingItemURI: URIToGroupingItem,
      xooMLDriver: dropboxXooMLDriver,
      itemDriver: dropboxItemDriver,
      syncDriver: mirrorSyncDriver,
      readIfExists: false
    },
    3: {
      groupingItemURI: URIToGroupingItem,
      xooMLDriver: dropboxXooMLDriver,
      itemDriver: dropboxItemDriver,
      syncDriver: mirrorSyncDriver,
      readIfExists: true
    }
  };
  createAssociationOptions = {
    1: {
      displayText: "case1"
    },
    2: {
      "displayText": "case2",
      "itemURI": "http://case2"
    },
    7: {
      "displayText": "case7",
      "itemName": "case7",
      "isGroupingItem": true
    }
  };

  function XooMLMock() {
  }
  self = XooMLMock.prototype;

  self.getAssociationOptions = function(caseNumber) {
    return createAssociationOptions[caseNumber];
  };

  self.getItemMirrorOptions = function (dropboxClient, caseNumber) {
    itemMirrorOptions[caseNumber].xooMLDriver.dropboxClient = dropboxClient;
    itemMirrorOptions[caseNumber].itemDriver.dropboxClient = dropboxClient;
    return itemMirrorOptions[caseNumber];
  };

  self.getGroupingItemURI = function () {
    return URIToGroupingItem;
  };

  self.getMockItemMirror = function (callback) {
    var self = this;

    new ItemMirror(self.getItemMirrorOptions(3), function (error, itemMirror) {
      if (error) {
        throw error;
      }

      return callback(error, itemMirror);
    });
  };

  self.getDropboxCredentials = function () {
    return dropboxClientCredentials;
  };

  return new XooMLMock();
});