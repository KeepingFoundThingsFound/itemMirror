define([
  "./XooMLMock.js"
], function(
  XooMLMock
) {
  "use strict";
  var self,
    _TEST_ATTR = "testAttr",
    _TEST_VALUE = "testValue",
    _TEST_NAMESPACE = "testNamespace",
    _EMPTY_ATTR_VALUE = "";

  function NamespaceAttributeTest(chai, itemMirrors, caseNumber, isAssociationTest) {
    var self = this;

    self._describe = describe;
    self._it = it;
    self._before = before;
    self._expect = chai.expect;
    self._GUID = null;
    self._itemMirrors = itemMirrors;
    self._caseNumber = caseNumber;
    self._namespaceAttributeFunction = isAssociationTest
      ? "AssociationNamespaceAttribute"
      : "FragmentNamespaceAttribute";
    self._addAttribute = "add" + self._namespaceAttributeFunction;
    self._removeAttribute = "remove" + self._namespaceAttributeFunction;
    self._setAttribute = "set" + self._namespaceAttributeFunction;
    self._getAttribute = "get" + self._namespaceAttributeFunction;
    self._isAssociationTest = isAssociationTest;
  }
  self = NamespaceAttributeTest.prototype;

  self.run = function () {
    var self = this;

    self._before(function (done) {
      if (self._isAssociationTest) {
        self._getItemMirror().createAssociation({displayText:"example"}, function (error, GUID) {
          if (error) {
              throw error;
          }

          self._GUID = GUID;
          done();
        });
      } else {
        done();
      }
    });
    self._start();
  };

  self._getItemMirror = function () {
    var self = this;

    return self._itemMirrors
      ? self._itemMirrors[self._caseNumber]
      : null;
  };

  self._start = function () {
    var self = this;

    self._it("get/set/remove/add " + self._namespaceAttributeFunction, function (done) {
      this.timeout(5000);

      self._manipulateAttribute(self._GUID, _TEST_ATTR, null, _TEST_NAMESPACE, self._addAttribute, function () {
        self._getAttributeTest(self._GUID, _EMPTY_ATTR_VALUE, function () {
          self._manipulateAttribute(self._GUID, _TEST_ATTR, _TEST_VALUE, _TEST_NAMESPACE, self._setAttribute, function () {
            self._getAttributeTest(self._GUID, _TEST_VALUE, function () {
              self._manipulateAttribute(self._GUID, _TEST_ATTR, null, _TEST_NAMESPACE, self._removeAttribute, function () {
                return self._getAttributeTest(self._GUID, null, done);
              });
            });
          });
        });
      });
    });
  };

  self._manipulateAttribute = function(GUID, attrName, attrValue, namespaceURI, attributeMethod, callback) {
    var self = this;

    if (GUID) {
      if (attrValue) {
        self._getItemMirror()[attributeMethod](attrName, attrValue, GUID, namespaceURI, function (error) {
          self._handleManipulateAttribute(error, callback);
        });
      } else {
        self._getItemMirror()[attributeMethod](attrName, GUID, namespaceURI, function (error) {
          self._handleManipulateAttribute(error, callback);
        });
      }
    } else {
      if (attrValue) {
        self._getItemMirror()[attributeMethod](attrName, attrValue, namespaceURI, function (error) {
          self._handleManipulateAttribute(error, callback);
        });
      } else {
        self._getItemMirror()[attributeMethod](attrName, namespaceURI, function (error) {
          self._handleManipulateAttribute(error, callback);
        });
      }
    }
  };

  self._handleManipulateAttribute = function (error, callback) {
    var self = this;

    if (error) {
      throw error;
    }

    callback();
  };

  self._validateGetAttribute = function (attrValue, expected, callback) {
    var self = this;

    if (expected !== null) {
      self._expect(attrValue).to.be.a("string");
    }
    self._expect(attrValue).to.equal(expected);

    callback();
  };

  self._getAttributeTest = function(GUID, expected, callback) {
    var self = this;

    if (GUID) {
      self._getItemMirror()[self._getAttribute](_TEST_ATTR, GUID, _TEST_NAMESPACE, function (error, attrValue) {
        if (error) {
          throw error;
        }

        return self._validateGetAttribute(attrValue, expected, callback);
      });
    } else {
      self._getItemMirror()[self._getAttribute](_TEST_ATTR, _TEST_NAMESPACE, function (error, attrValue) {
        if (error) {
          throw error;
        }

        return self._validateGetAttribute(attrValue, expected, callback);
      });
    }
  };

  return NamespaceAttributeTest;
});
