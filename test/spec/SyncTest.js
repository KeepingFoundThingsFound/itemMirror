define([
  "ItemMirror",
  "../../scripts/XooMLConfig.js",
  "../../scripts/XooMLUtil.js",
  "./XooMLMock.js"
], function(
  ItemMirror,
  XooMLConfig,
  XooMLUtil,
  XooMLMock
){
  "use strict";

  var self;

  function SyncTest(dropboxClient, chai, groupingItemURI, itemMirrors, caseNumber) {
    var self = this;

    self._describe = describe;
    self._it = it;
    self._expect = chai.expect;
    self._itemMirrorOptions = XooMLMock.getItemMirrorOptions(dropboxClient, 3);
    self._itemMirrorOptions.groupingItemURI = groupingItemURI;
    self._groupingItemURI = groupingItemURI;
    self._itemMirror = null;
    self._itemMirrors = itemMirrors;
    self._caseNumber = caseNumber;
    self._dropboxClient = dropboxClient;
  }
  self = SyncTest.prototype;

  self.run = function () {
    var self = this;
    describe("#sync", function () {
      this.timeout(5000);

      before(function (done) {
        this.timeout(0);
        var
          orginalPath = self._groupingItemURI + "/" + XooMLConfig.xooMLFragmentFileName,
          tempPath = "/" + XooMLConfig.xooMLFragmentFileName;

        self._getDropboxClient().move(orginalPath, tempPath, function (error, stat) {
          self._getDropboxClient().remove(self._groupingItemURI, function (error) {
            self._getDropboxClient().mkdir(self._groupingItemURI, function (error) {
              self._getDropboxClient().move(tempPath, orginalPath, function (error, stat) {
                done();
              });
            });
          });
        });
      });

      return self._start();
    });
  };

  self._getDropboxClient = function () {
    var self = this;

    return self._dropboxClient;
  };

  self._getItemMirror = function () {
    var self = this;

    return self._itemMirrors[self._caseNumber]
  };

  self._start = function () {
    var self = this;

    self._it("Add new grouping item, then sync", function (done) {
      self._getItemMirror()._itemDriver.createGroupingItem(self._groupingItemURI + "/1",function(){
        self._getItemMirror().sync(function(error){
          if (error) { throw error; }
          self._getItemMirror().listAssociations(function(error,list){
            self._expect(list.length).to.equal(1);
            done();
          });
        });
      });
    });

    self._it("Add two items", function(done) {
      self._getItemMirror()._itemDriver.createNonGroupingItem(self._groupingItemURI + "/a.txt","",function(){
        self._getItemMirror()._itemDriver.createGroupingItem(self._groupingItemURI + "/1",function(){
          self._getItemMirror().sync(function(){
            self._getItemMirror().listAssociations(function(error,list){
              self._expect(list.length).to.equal(2);
              done();
            });
          });
        });
      });
    });

    self._it("Add one item, Remove two items",function(done){
       self._getItemMirror()._itemDriver.createNonGroupingItem(self._groupingItemURI + "/b.txt","",function(){
         self._getItemMirror()._itemDriver.deleteNonGroupingItem(self._groupingItemURI + "/a.txt",function(){
           self._getItemMirror()._itemDriver.deleteGroupingItem(self._groupingItemURI + "/1",function(){
             self._getItemMirror().sync(function(){
               self._getItemMirror().listAssociations(function(error,list){
                self._expect(list.length).to.equal(1);
                done();
              });
            });
          });
        });
      });
    });

    self._it("Sync Test -- Remove one item",function(done){
       self._getItemMirror()._itemDriver.deleteNonGroupingItem(self._groupingItemURI + "/b.txt",function(){
         self._getItemMirror().sync(function(){
           self._getItemMirror().listAssociations(function(error,list){
            self._expect(list.length).to.equal(0);
            done();
          });
        });
      });
    });
  };

  return SyncTest;
});