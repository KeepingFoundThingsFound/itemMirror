define([
  "ItemMirror",
  "../../scripts/XooMLConfig.js",
  "../../scripts/XooMLUtil.js",
  "./NamespaceAttributeTest.js",
  "./SyncTest.js",
  "./XooMLMock.js"
], function(
  ItemMirror,
  XooMLConfig,
  XooMLUtil,
  NamespaceAttributeTest,
  SyncTest,
  XooMLMock
){
  "use strict";

  var
    expect = chai.expect,
    dropboxClient,
    itemMirrors;

  dropboxClient = new Dropbox.Client(XooMLMock.getDropboxCredentials());
  dropboxClient.authDriver(new Dropbox.Drivers.Redirect({
    rememberUser: true
  }));
  itemMirrors = {};

  function testItemMirror(caseNumber) {
    describe("#getGroupingItemURI", function () {
      expectsInitialValue(
        caseNumber,
        "expects to have an initial value",
        XooMLMock.getGroupingItemURI(),
        "getGroupingItemURI"
      );
    });
    describe("#getSchemaVersion", function () {
      expectsInitialValue(
        caseNumber,
        "expects to have an initial value",
        XooMLConfig.schemaVersion,
        "getSchemaVersion"
      );
    });
    describe("#getSchemaLocation", function () {
      expectsInitialValue(
        caseNumber,
        "expects to have an initial value",
        XooMLConfig.schemaLocation,
        "getSchemaLocation"
      );
    });
    describe("#getItemDriver", function() {
      expectsInitialValue(
        caseNumber,
        "expects to have an initial value",
        XooMLMock.getItemMirrorOptions(dropboxClient, caseNumber).itemDriver.driverURI,
        "getItemDriver"
      );
    });
    describe("#getItemDescribed", function() {
      expectsInitialValue(
        caseNumber,
        "expects to be have an initial value",
        ".",
        "getItemDescribed"
      );
    });
    describe("#getDisplayName", function() {
      expectsInitialValue(
        caseNumber,
        "expects displayName to have an initial value",
        "test",
        "getDisplayName"
      );
    });
    describe("#listAssociations", function () {
      it("get an array of associations", function (done) {
        itemMirrors[caseNumber].listAssociations(function (error, GUIDs) {
          expect(GUIDs).to.be.a("array");
          done();
        });
      });
    });

    createItemMirrorForAssociatedGroupingItemTest(caseNumber);

    describe("SyncTest", function() {
      new SyncTest(dropboxClient, chai, XooMLMock.getGroupingItemURI(), itemMirrors, caseNumber).run();
    });


    describe("#createAssociation", function () {
      createAssociationTest(caseNumber, "createAssociation case1",
        XooMLMock.getAssociationOptions(1));

      createAssociationTest(caseNumber, "createAssociation case2",
        XooMLMock.getAssociationOptions(2));

      createAssociationCase7Test(caseNumber);
    });


    upgradeAssociationTest(caseNumber);
    //isCurrentTest(caseNumber,"expects isCurrent equals to true");
    hasNamespaceTest(caseNumber, "hasFragmentNamespace", "setFragmentNamespaceAttribute", false);
    hasNamespaceTest(caseNumber, "hasAssociationNamespace", "setAssociationNamespaceAttribute", true);

    describe("#FragmentNamespaceAttribute", function () {
      this.timeout(5000);
      new NamespaceAttributeTest(chai, itemMirrors, caseNumber, false).run();
    });
    describe("#AssociationNamespaceAttribute", function () {
      this.timeout(5000);
      new NamespaceAttributeTest(chai, itemMirrors, caseNumber, true).run();
    });
  }

  function getItemMirror(caseNumber) {
    return itemMirrors[caseNumber];
  }

  function createOrOverwriteAssociationCase7 (caseNumber, callback) {
    dropboxClient.mkdir(XooMLMock.getGroupingItemURI(), function (error) {
      var path = XooMLMock.getGroupingItemURI() + "/" + "case7";
      dropboxClient.remove(path, function (error, stat) {
        itemMirrors[caseNumber].createAssociation(XooMLMock.getAssociationOptions(7),
          function (error, tempGUID) {
            if (error) {
              throw error;
            }
            callback(tempGUID);
          });
      });
    });
  }

  function createItemMirrorForAssociatedGroupingItemTest(caseNumber) {
    describe("#createItemMirrorForAssociatedGroupingItem", function () {
      var GUID;
      this.timeout(5000);

      before(function (done) {
        createOrOverwriteAssociationCase7(caseNumber, function (tempGUID) {
          GUID = tempGUID;
          done();
        });
      });

      it("create new ItemMirror from associated grouping item, and get parent", function (done) {
        this.timeout(0);

        itemMirrors[caseNumber].createItemMirrorForAssociatedGroupingItem(
          GUID, function (error, itemMirror) {
          if (error) {
            throw error;
          }
          expect(itemMirror).to.not.equal(null);
          expect(itemMirror).to.be.an.instanceof(ItemMirror);


          itemMirror.getItemDescribed(function (error, displayText) {
            if (error) {
              throw error;
            }

            expect(displayText).to.equal(".");

            itemMirror.getParent(function (error, parentItemMirror) {
              if (error) {
                throw error;
              }

              expect(parentItemMirror).to.equal(getItemMirror(caseNumber));
              done();
            });
          });
        });
      });
    });
  }

  function hasNamespaceTest(caseNumber, namespaceFunction, setNamespaceFunctionAttribute, isAssociation) {
    var testNamespace = "testNamespace", hasTest;

    hasTest = function (error, value, done) {
      if (error) {
        throw error;
      }

      expect(value).to.equal(true);
      done();
    };

    describe("prepare for hasNamespaceTest", function () {
      this.timeout(6000);

      var GUID;
      before(function (done) {
        if (isAssociation) {
          itemMirrors[caseNumber].createAssociation(XooMLMock.getAssociationOptions(1), function (error, tempGUID) {
            GUID = tempGUID;
            itemMirrors[caseNumber][setNamespaceFunctionAttribute]("test", "test", GUID, testNamespace, function (error) {
              if (error) {
                throw error;
              }
              done();
            });
          });
        } else {
          itemMirrors[caseNumber][setNamespaceFunctionAttribute]("test", "test", testNamespace, function (error) {
            if (error) {
              throw error;
            }
            done();
          });
        }
      });

      it("#" + namespaceFunction, function (done) {
       if (GUID) {
         itemMirrors[caseNumber][namespaceFunction](GUID, testNamespace, function (error, hasNamespace) {
          hasTest(error, hasNamespace, done);
         });
       } else {
         itemMirrors[caseNumber][namespaceFunction](testNamespace, function (error, hasNamespace) {
           hasTest(error, hasNamespace, done);
         });
       }
      });
    });
  }

  function createAssociationCase7Test(caseNumber) {
    describe("remove directory for case7", function () {
      var path = XooMLMock.getGroupingItemURI() + "/" + "case7";

      before(function (done) {
        dropboxClient.remove(path, function (error, stat) {
          done();
        });
      });
      createAssociationTest(caseNumber, "createAssociation case7",
        XooMLMock.getAssociationOptions(7));
    });
  }

  function upgradeAssociationTest(caseNumber) {
    describe("prepare for upgradeAssociation", function () {
      var path = XooMLMock.getGroupingItemURI() + "/" + XooMLMock.getAssociationOptions(1).displayText;

      before(function (done) {
        dropboxClient.remove(path, function (error, stat) {
          done();
        });
      });

      it("upgradeAssociation phantom to grouping", function (done) {
        this.timeout(5000);

        itemMirrors[caseNumber].createAssociation(XooMLMock.getAssociationOptions(1),
          function (error, GUID) {
            if (error) {
              throw error;
            }

            itemMirrors[caseNumber].upgradeAssociation({"GUID": GUID}, function (error) {
              if (error) {
                throw error;
              }
              itemMirrors[caseNumber].getAssociationLocalItem(GUID, function (error, localItem) {
                if (error) {
                  throw error;
                }

                expect(localItem).to.equal(XooMLMock.getAssociationOptions(1).displayText);

                itemMirrors[caseNumber].getAssociationAssociatedItem(GUID, function (error, associatedItem) {
                  if (error) {
                    throw error;
                  }

                  expect(associatedItem).to.equal(XooMLMock.getAssociationOptions(1).displayText);
                  done();
                  // TODO check if subfolder exists
                });
              });
            });
          });
      });
    });
  }

  function createAssociationTest(caseNumber, description, options) {
    it(description + " and delete it", function (done) {
      this.timeout(5000);

      createAssociationMock(caseNumber, options, done)
    });
  }


  function createAssociationMock (caseNumber, options, callback) {
    itemMirrors[caseNumber].createAssociation(options, function (error, GUID) {
      if (error) {
        throw error;
      }
      if (!XooMLUtil.isGUID(GUID)) {
        throw XooMLExceptions.invalidType;
      }

      itemMirrors[caseNumber].getAssociationDisplayText(GUID, function (error, displayText) {
        expect(displayText).to.be.a("string");
        expect(displayText).to.equal(options.displayText);

        itemMirrors[caseNumber].deleteAssociation(GUID, function (error) {
          if (error) {
            throw error;
          }
          // TODO check if association was deleted.

          return callback();
        });
      });
    });
  }

  function isCurrentTest(caseNumber, description) {
    it(description,function(done){
      this.timeout(5000);

      itemMirrors[caseNumber].isCurrent(function (error,value){
        if (error) { throw error; }
        expect(value).to.equal(true);
        done();
      });
    });
  }

  function expectsInitialValue(caseNumber, description, initialValue, getFunction) {
    it(description, function (done) {
      itemMirrors[caseNumber][getFunction](function (error, getValue) {
        if (error) { throw error; }

        expect(getValue).to.be.a("string");
        expect(getValue).to.equal(initialValue);
        done();
      });
    });
  }

  function getSetTest(caseNumber, description, getFunction, setFunction, newValue) {
    newValue = newValue || "test";

    it(description, function (done) {
      itemMirrors[caseNumber][setFunction](newValue, function (error) {
        if (error) { throw error; }
        itemMirrors[caseNumber][getFunction](function (error, getValue) {
          if (error) { throw error; }
          expect(getValue).to.be.a("string");
          expect(getValue).to.equal(newValue);
          done();
        });
      });
    });
  }

  function constructItemMirror(caseNumber, callback) {
    new ItemMirror(XooMLMock.getItemMirrorOptions(dropboxClient, caseNumber), function (error, itemMirrorTemp) {
      if (error) { throw error; }
      itemMirrors[caseNumber] = itemMirrorTemp;
      callback();
    });
  }

  before(function (done) {
    var path = XooMLMock.getItemMirrorOptions(dropboxClient, 2).groupingItemURI + "/" + XooMLConfig.xooMLFragmentFileName;
    this.timeout(0);

    dropboxClient.authenticate(function (error, client) {
      if (error) { throw error; }

      client.remove(path, function (error, stat) {
        constructItemMirror(2, function () {
          constructItemMirror(1, function () {
            constructItemMirror(3, function () {
              done();
            });
          });
        });
      });
    });
  });

  describe("ItemMirror Case 2", function () {
    testItemMirror(2);
  });

  describe("ItemMirror Case 3", function () {
    testItemMirror(3);
  });

  describe("ItemMirror Case 1", function () {
    testItemMirror(1);
  });
});