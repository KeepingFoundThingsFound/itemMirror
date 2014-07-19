/**
 * ItemMirror represents an Item according to the XooML2 specification.
 *
 * It can be instantiated using one of the following two cases based on the
 * given arguments.
 *
 * 1. XooMLFragment already exists. Given xooMLFragmentURI and xooMLDriver.
 * 2. The XooMLFragment is created from an existing groupingItemURI.
 * Given a groupingItemURI, saveLocationURI. Optionally a itemDriver,
 * syncDriver, and a xooMLDriver can be supplied for the XooMLFragment.
 * 3. Try case 1, and then fallback on case 2.
 *
 * Throws NullArgumentException when options is null.
 *
 * Throws MissingParameterException when options is not null and a required
 * argument is missing.
 *
 * @class ItemMirror
 * @constructor
 *
 * @param {Object} options Data to construct a new ItemMirror with
 *
 *  @param {String} options.groupingItemURI URI to the grouping item. Required
 *                  for all cases.
 *
 *  @param {String} options.itemDriver Data for the ItemDriver to
 *                  construct ItemMirror with. Required for all cases.
 *                  Can contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.itemDriver.driverURI URI of the driver.
 *
 *  @param {String} options.xooMLDriver Data for the XooMLDriver to
 *                  construct ItemMirror with. Required for all cases.
 *                  Can contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.xooMLDriver.driverURI URI of the driver.
 *
 *  @param {String} options.syncDriver Data for the SyncDriver to
 *                  construct ItemMirror with. Required Case 2 & 3. Can
 *                  contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.syncDriver.driverURI URI of the driver.
 *
 *  @param {Boolean} options.readIfExists True if ItemMirror
 *                   should create an ItemMirror if it does not exist,
 *                   else false. Required for Case 2 & 3.
 *
 *  @param {ItemMirror} options.parent Parent ItemMirror of the ItemMirror
 *                      to be constructed. Optional.
 *
 * @param {Function} callback Function to execute once finished.
 *  @param {Object}   callback.error Null if no error has occurred
 *                    in executing this function, else an contains
 *                    an object with the error that occurred.
 *  @param {ItemMirror} callback.itemMirror Newly constructed ItemMirror
 */
define([
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js",
  "./PathDriver.js",
  "./FragmentEditor.js",
  "./ItemDriver.js",
  "./XooMLDriver.js",
  "./SyncDriver.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  ItemDriver,
  XooMLDriver,
  SyncDriver) {
  "use strict";

  var
    _CONSTRUCTOR_CASE_1_OPTIONS = {
      "groupingItemURI":  true,
      "xooMLDriver":      true,
      "itemDriver":       true,
      "parent":           false
    },
    _CONSTRUCTOR_CASE_2_AND_3_OPTIONS = {
      "groupingItemURI": true,
      "xooMLDriver":     true,
      "itemDriver":      true,
      "syncDriver":      true,
      "readIfExists":    true,
      "parent":          false
    },
    _UPGRADE_ASSOCIATION_OPTIONS = {
      "GUID": true,
      "localItemURI": false
    },
    self;

  function ItemMirror(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_2_AND_3_OPTIONS, options) &&
      !XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_1_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    var self = this, xooMLFragmentURI;

    // private variables
    self._xooMLDriver = null;
    self._itemDriver = null;
    self._syncDriver = null;
    self._fragmentEditor = null;
    self._parent = options.parent;
    self._groupingItemURI = PathDriver.formatPath(options.groupingItemURI);
    self._newItemMirrorOptions = options;

    xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);

    new XooMLDriver(options.xooMLDriver, function (error, xooMLU) {
      self._xooMLDriver = xooMLU;
      self._getItemU(xooMLFragmentURI, options, function (error) {
        if (error) {
          return callback(error);
        }

        self._save(function (error) {
          if (error) {
            return callback(error);
          }

          // change options here, after they have been used
          if (!self._newItemMirrorOptions.hasOwnProperty("syncDriver")) {
            self._newItemMirrorOptions.syncDriver = {
              utilityURI: "MirrorSyncUtility"
            };
          }
          self._newItemMirrorOptions.groupingItemURI = null;

          return callback(false, self);
        });
      });
    });
  }
  self = ItemMirror.prototype;

  /**
   * @method getDisplayName
   * @return {String} The display name.
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.displayName Display name.
   */
  self.getDisplayName = function (callback) {
    var self = this, displayName;

    if (PathDriver.isRoot(self._groupingItemURI)) {
      displayName = "";
    } else {
      displayName = PathDriver.formatPath(self._groupingItemURI);
      displayName = PathDriver.splitPath(displayName);
      displayName = displayName[displayName.length - 1];
    }

    return callback(false, displayName);
  };

  /**
   *
   * @method getSchemaVersion
   * @return {String} XooML schema version.
   */
  self.getSchemaVersion = function (callback) {
    var self = this;

    return self._fragmentEditor.getSchemaVersion();
  };

  /**
   *
   * @method getSchemaLocation
   * @return {String} XooML schema location.
   */
  self.getSchemaLocation = function () {
    var self = this;

    return self._fragmentEditor.getSchemaLocation();
  };

  /**
   * Returns URI pointing to item described by the metadata of a fragment. A URI
   * might point to just about anything that can be interpreted as a grouping
   * item. For example: a conventional file system folder or a “tag as
   * supported by any of several applications.
   *
   * @method getItemDescribed
   * @return {String} A URI pointing to item described by the metadata
   * of a fragment if it exists, else returns null.
   *
   */
  self.getURIforItemDescribed = function () {
    var self = this;

    return self._fragmentEditor.getItemDescribed();
  };

  /**
   * An item driver supports HTML5 filesystem API. self driver must
   * work hand in glove with SyncU. There is no exclusive control over
   * items as stored in the dataStore so need to view and synchronize.
   * Invoked directly to Open and Close. Delete, create. Invoked
   * indirectly via UI.
   *
   * @method getItemDriver
   * @return {String} The URI of the item driver.
   */
  self.getItemDriver = function () {
    var self = this;

    return self._fragmentEditor.getItemDriver();
  };

  /**
   *
   * @method getSyncDriver
   * @return {String} Returns the sync driver URI.
   */
  self.getSyncDriver = function () {
    var self = this;

    return self._fragmentEditor.getSyncDriver();
  };

  /**
   * 
   * @method getURLForAssociatedNonGroupingItem
   * @return {String} A publicly available URL hosted at dropbox for an associated non-grouping item
   * @param {String} GUID GUID of the association to get
   * @param {Function} callback Function to execute once finished
   *  @param {Object} callback.error Null if no error has occurred
   *                  in executing this function, else an contains
   *                  an object with the error that occurred.
   *  @param {String} callback.publicURL Local item of the association
   *                  with the given GUID.
   */
  self.getURLForAssociatedNonGroupingItem = function (GUID, callback) {
    var self = this;
    
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    
    self.getAssociationLocalItem(GUID, function (error, localItem) {
      var path;
      if (error) {
        return callback(error);
      }
      path = PathDriver.joinPath(self._groupingItemURI, localItem);
      
      self._itemDriver.checkExisted(path, function (error, result) {
        if (error) {
          return callback(error);
        }
        if (result === true) {
          return self._itemDriver.getURL(path, function (error, publicURL) {
            if (error) {
              return callback(error);
            }
            return callback(false, publicURL);
          });
        }else {
          //file that should exist does not
          return callback(XooMLExceptions.invalidState);
        }
      });
    });
  };
  
  /**
   *
   * @method getXooMLDriver
   * @return {String} The XooML driver.
   */
  self.getXooMLDriver = function () {
    var self = this;

    return self._fragmentEditor.getXooMLDriver();
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   *
   * @method getAssociationDisplayText
   * @return {String} The display text for the association with the given GUID.
   *
   * @param {String} GUID GUID of the association to get.
   */
  self.getAssociationDisplayText = function (GUID) {
    var self = this;

    return self._fragmentEditor.getAssociationDisplayText(GUID);
  };

  /**
   * Sets the display text for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or displayName is null. <br/>
   * Throws InvalidTypeException if GUID or displayName is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationDisplayText
   *
   * @param {String}   GUID        GUID of the association to set.
   * @param {String}   displayText Display text to be set.
   */
  self.setAssociationDisplayText = function (GUID, displayText) {
    var self = this;

    self._fragmentEditor.setAssociationDisplayText(GUID, displayText);
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationLocalItemName
   * @return {String} The local item for the association with the given GUID.
   *
   * @param {String} GUID GUID of the association to get.
   */
  self.getAssociationLocalItemName = function (GUID) {
    var self = this;

    return self._fragmentEditor.getAssociationLocalItemName(GUID);
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociatedItemOfAssociation
   * @return {String} The associated item for the association with the given GUID.
   * @param {String} GUID GUID of the association to get.
   *                    association with the given GUID.
   */
  self.getAssociatedItemOfAssociation = function (GUID) {
    var self = this;

    return self._fragmentEditor.getAssociatedItemOfAssociation(GUID);
  };

  /**
   * Throws NullArgumentException if attributeName or namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName or namespaceURI is not a
   * String. <br/>
   *
   * @method getFragmentNamespaceAttribute
   * @return {String} Returns the value of the given attributeName for the
   * fragmentNamespaceData with the given namespaceURI.
   
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} namespaceURI Name of the namespace of the given
   *                               attributeName.
   *
   */
  self.getFragmentNamespaceAttribute = function (attributeName, namespaceURI) {
    var self = this;

    return self._fragmentEditor.getFragmentNamespaceAttribute(attributeName, namespaceURI);
  };

  /**
   * Adds the given attributeName to the association with the given GUID and
   * namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   * Throws an InvalidStateException when the given attributeName has already
   * been added. <br/>
   *
   * @method addFragmentNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.addFragmentNamespaceAttribute = function (attributeName, namespaceURI) {
    var self = this;

    self._fragmentEditor.addFragmentNamespaceAttribute(attributeName, namespaceURI);
  };

  /**
   * Removes the fragment namespace attribute with the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, or namespaceURI is not
   * a String. <br/>
   * Throws an InvalidStateException when the given attributeName is not an
   * attribute. <br/>
   *
   * @method removeFragmentNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.removeFragmentNamespaceAttribute = function (attributeName, namespaceURI) {
    var self = this;

    self._fragmentEditor.removeFragmentNamespaceAttribute(attributeName, namespaceURI);
  };

  /**
   * Checks if the fragment has the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, or namespaceURI is not
   * a String. <br/>
   *
   * @method hasFragmentNamespace
   * @return {Boolean} True if the fragment has the given
   * namespaceURI, otherwise false.
   *
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  self.hasFragmentNamespace = function (namespaceURI) {
    var self = this;

    return self._fragmentEditor.hasFragmentNamespace(namespaceURI);
  };

  /**
   * Sets the value of the given attributeName with the given attributeValue
   * for the fragmentNamespaceData with the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, attributeValue, or
   * namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName, attributeValue, or
   * namespaceURI is not a String. <br/>
   *
   * @method setFragmentNamespaceAttribute
   * @param {String} attributeName  Name of the attribute to be set.
   * @param {String} attributeValue Value of the attribute to be set.
   * @param {String} namespaceURI  Name of the namespace of the given
   *                                attributeName.
   */
  self.setFragmentNamespaceAttribute = function (attributeName, attributeValue, namespaceURI) {
    var self = this;

    self._fragmentEditor.setFragmentNamespaceAttribute(attributeName,
      attributeValue, namespaceURI);
  };

  /**
   * Throws NullArgumentException if namespaceURI is null. <br/>
   * Throws InvalidTypeException if namespaceURI is not a String. <br/>
   *
   * @method listFragmentNamespaceAttributes
   * @return {String[]} An array of the attributes within the
   * fragmentNamespaceData with the given namespaceURI.
   *
   * @param {String} namespaceURI  Name of the namespace of the given
   *                                attributeName.
   *
  */
  self.listFragmentNamespaceAttributes = function (namespaceURI) {
    var self = this;

    return self._fragmentEditor.listFragmentNamespaceAttributes(namespaceURI);
  };

  /**
   * Throws NullArgumentException if namespaceURI is null. <br/>
   * Throws InvalidTypeException if namespaceURI is not a String. <br/>
   *
   * @method getFragmentNamespaceData
   * @return {String} The fragment namespace data with the given namespaceURI.
   *
   * @param {String} namespaceURI URI of the namespace to be set.
   *
   */
  self.getFragmentNamespaceData = function (namespaceURI) {
    var self = this;
    
    return self._fragmentEditor.getFragmentNamespaceData(namespaceURI);
  };

  /**
   * Sets the fragment namespace data with the given namespaceURI.
   *
   * Throws NullArgumentException if namespaceURI or data is null. <br/>
   * Throws InvalidTypeException if namespaceURI or data is not a String. <br/>
   *
   * @method setFragmentNamespaceData
   *
   * @param {String} data Fragment namespace data to be set. Must be valid
   *                 namespaceData.
   * @param {String} namespaceURI URI of the namespace to be set.
   *
   */
  self.setFragmentNamespaceData = function (data, namespaceURI) {
    var self = this;

    self._fragmentEditor.setFragmentNamespaceData(data, namespaceURI);
  };

  /**
   * Creates an ItemMirror from the associated grouping item represented by
   * the given GUID.
   *
   * Throws NullArgumentException if GUID or callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a string, and callback is
   * not a function. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method createItemMirrorForAssociatedGroupingItem
   * @return {ItemMirror} Possibly return an itemMirror if the GUID is a grouping item
   *
   * @param {String} GUID GUID of the association to create the ItemMirror
   *                 from.
   *
   */
  self.createItemMirrorForAssociatedGroupingItem = function (GUID, callback) {
    var self = this;

    self.isAssociatedItemGrouping(GUID, function (error, isGrouping) {
      if (error) {
        return callback(error);
      }
      if (!isGrouping) {
        return callback(false, null);
      }

      self._fragmentEditor.getAssociatedItemOfAssociation(GUID, function (error, associatedItem) {
        if (error) {
          return callback(error);
        }
        var associatedXooMLFragment;

        associatedXooMLFragment = PathDriver.joinPath(associatedItem, XooMLConfig.xooMLFragmentFileName);

        self._fragmentEditor.setAssociationAssociatedXooMLFragment(GUID, associatedXooMLFragment, function (error) {
          if (error) {
            return callback(error);
          }
          var path, itemMirrorOptions;

          path = PathDriver.joinPath(self._groupingItemURI, associatedItem);
          itemMirrorOptions = self._newItemMirrorOptions;
          itemMirrorOptions.groupingItemURI = path;
          itemMirrorOptions.readIfExists = true;
          itemMirrorOptions.parent = self;

          new ItemMirror(itemMirrorOptions, function (error, itemMirror) {
            if (error) {
              return callback(error);
            }

            self.sync(function (error) {
              if (error) {
                throw error;
              }

              return callback(false, itemMirror);
            });
          });
        });
      });
    });
  };

  /**
   * Creates an association based on the given options and the following
   * cases.
   *
   * Cases 1, 2, 7 implemented. All else are not implemented.
   *
   * 1. Simple text association declared phantom. <br/>
   * 2. Link to existing non-grouping item, phantom. This can be a URL <br/>
   * 3. Link to existing non-grouping item, real. <br/>
   * 4. Link to existing grouping item, phantom. <br/>
   * 5. Link to existing grouping item, real. <br/>
   * 6. Create new local non-grouping item. <br/>
   * 7. Create new local grouping item. <br/>
   *
   * Throws NullArgumentException when options, or callback is null. <br/>
   * Throws InvalidTypeException when options is not an object and callback
   * is not a function. <br/>
   * Throws MissingParameterException when an argument is missing for an expected
   * case. <br/>
   *
   * @method createAssociation
   *
   * @param {Object} options Data to create an new association for.
   *
   *  @param {String}  options.displayText Display text for the association.
   *                   Required in all cases.
   *
   *  @param {String}  options.itemURI URI of the item. Required for case 2 & 3. Note: Please ensure "http://" prefix exists at the beginning of the string when referencing a Web URL and not an Item.
   *
   *  @param {Boolean} options.localItemRequested True if the local item is
   *                   requested, else false. Required for cases 2 & 3.
   *
   *  @param {String}  options.groupingItemURI URI of the grouping item.
   *                   Required for cases 4 & 5.
   *
   *  @param {String}  options.xooMLDriverURI URI of the XooML driver for the
   *                   association. Required for cases 4 & 5.
   *
   *  @param {String}  options.itemName URI of the new local
   *                   non-grouping/grouping item. Required for cases 6 & 7.
   *
   *  @param {String}  options.isGroupingItem True if the item is a grouping
   *                   item, else false. Required for cases 6 & 7.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.GUID GUID of the association created.
   */
  self.createAssociation = function (options, callback) {
    var self = this, isSimple, isLinkNonGrouping, isLinkGrouping, isCreate;

    if (!XooMLUtil.isFunction(callback)) {
      throw XooMLExceptions.invalidType;
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }

    isSimple = XooMLUtil.hasOptions(XooMLConfig.createAssociationSimple, options);
    isLinkNonGrouping = XooMLUtil.hasOptions(XooMLConfig.createAssociationLinkNonGrouping, options);
    isLinkGrouping = XooMLUtil.hasOptions(XooMLConfig.createAssociationLinkGrouping, options);
    isCreate = XooMLUtil.hasOptions(XooMLConfig.createAssociationCreate, options);

    self._fragmentEditor.createAssociation(options, function (error, GUID) {
      if (error) {
        return callback(error);
      }

      if (isSimple) {
        self._createAssociationSimple(GUID, options, callback);
      } else if (isLinkNonGrouping) {
        return self._createAssociationLinkNonGrouping(GUID, options, callback);
      } else if (isLinkGrouping) {
        return self._createAssociationLinkGrouping(GUID, options, callback);
      } else if (isCreate) {
        return self._createAssociationCreate(GUID, options, callback);
      } else {
        return callback(XooMLExceptions.missingParameter);
      }
    });
  };

  /**
   * Cuts (returns path to) the association represented by a given GUID
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method cutAssociation
   *
   * @param {String} GUID GUID of the association to execute once finished.
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   * @param {String} callback.ItemMirror path of the source ItemMirror
   * @param {String} callback.GUID GUID of the association to execute once finished.
   * @param {Boolean} callback.cut Whether or not to cut the item and remove the source association
   */
   self.cutAssociation = function (GUID, callback) {
    var self = this;
    
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    return callback(false, self, GUID, true);
   };
   
  /**
   * Copies (returns path to) the association represented by a given GUID
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method copyAssociation
   *
   * @param {String} GUID GUID of the association to execute once finished.
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   * @param {String} callback.ItemMirror path of the source ItemMirror
   * @param {String} callback.GUID GUID of the association to execute once finished.
   * @param {Boolean} callback.cut Whether or not to cut the item and remove the source association
   */
   self.copyAssociation = function (GUID, callback) {
    var self = this;
    
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    return callback(false, self, GUID, false);
   };
   
  /**
   * Paste (inserts) a cut or copy association represented by a given GUID and source ItemMirror
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method pasteAssociation
   *
   * @param {String} ItemMirror ItemMirror that contains the association you want moved or copied
   * @param {String} GUID GUID of the association to move or copy
   * @param {Boolean} Cut Cuts the item, deleting the source Association if set to true. Copies if false.
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   self.pasteAssociation = function (ItemMirror, GUID, cut, callback) {
    var self = this;
    
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (cut) {
      ItemMirror.moveAssociation(GUID, self, function(error){
        if (error) {
          return callback(error);
        }
        return callback(false);
      });
    }else{ //copy
      ItemMirror.duplicateAssociation(GUID, self, function(error){
        if (error) {
          return callback(error);
        }
        return callback(false);
      });
    }
    
   };
  
    
  /**
   * Duplicates (copies) an association to another ItemMirror Object (representing a grouping item)
   *
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method duplicateAssociation
   *
   * @param {String} GUID GUID of the association you wish to copy/duplicate
   * @param {ItemMirror} ItemMirror ItemMirror representing the grouping item you want to move the GUID object to
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   self.duplicateAssociation = function (GUID, ItemMirror, callback) {
    var self = this;
    
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    
    self.getAssociationLocalItemName(GUID, function (error, localItem) {
      if (error) {
        return callback(error);
      }
        //phantom case
        if (!localItem) {
          var options = {};
          //getDisplayText and Create new Simple DisplayText Assoc in DestItemMirror
          self.getAssociationDisplayText(GUID, function(error, displayText){
            if (error) {
              return callback(error);
            }
            options.displayText = displayText;
            
            //check for case 2, phantom NonGrouping Item with ItemURI a.k.a associatedItem
            self.getAssociatedItemOfAssociation(GUID, function(error, associatedItem){
              if (error) {
                return callback(error);
              }
              options.itemURI = associatedItem; 
            });
          });
          //create a new phantom association in destItemMirror
          ItemMirror.createAssociation(options, function(error, GUID) {
            if(error) {
              return callback(error);
            }
          });
          return ItemMirror._save(callback);
        }
        
        self._handleDataWrapperCopyAssociation(GUID, localItem, ItemMirror, error, callback);
      
    });
    
   };
  /**
   * Moves an association to another ItemMirror Object (representing a grouping item)
   *
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method moveAssociation
   *
   * @param {String} GUID GUID of the item you want to paste or move
   * @param {ItemMirror} ItemMirror ItemMirror representing the grouping item you want to move the GUID object to
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   self.moveAssociation = function (GUID, ItemMirror, callback) {
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    
    self.getAssociationLocalItemName(GUID, function (error, localItem) {
      if (error) {
        return callback(error);
      }
        //phantom case
        if (!localItem) {
          var options = {};
          //getDisplayText and Create new Simple DisplayText Assoc in DestItemMirror
          self.getAssociationDisplayText(GUID, function(error, displayText){
            if (error) {
              return callback(error);
            }
            options.displayText = displayText;
            //check for case 2, phantom NonGrouping Item with ItemURI a.k.a associatedItem
            self.getAssociatedItemOfAssociation(GUID, function(error, associatedItem){
              if (error) {
                return callback(error);
              }
              options.itemURI = associatedItem;
            });
          });
          //create a new phantom association in destItemMirror
          ItemMirror.createAssociation(options, function(error, newGUID) {
            if(error) {
              return callback(error);
            }
            //delete the current phantom association
            self._fragmentEditor.deleteAssociation(GUID, function (error) {
              if(error) {
                return callback(error);
              }
              return self._save(callback);
            });
            return ItemMirror._save(callback);
          });
        }
        
        self._handleDataWrapperMoveAssociation(GUID, localItem, ItemMirror, error, callback);
      
    });
    
   };
  
  /**
   * Deletes the association represented by the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method deleteAssociation
   *
   * @param GUID {String} GUID of the association to be deleted.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.deleteAssociation = function (GUID, callback) {
    var self = this;

    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.getAssociationLocalItemName(GUID, function (error, localItem) {
      if (error) {
        return callback(error);
      }

      self._fragmentEditor.deleteAssociation(GUID, function (error) {
        if (error) {
          return callback(error);
        }
        if (!localItem) {
          // Phantom case
          return self._save(callback);
        }

        self._handleDataWrapperDeleteAssociation(GUID, localItem, error, callback);
      });
    });

  };

  /**
   * Upgrades a given association without a local item. Local item is named
   * by a truncated form of the display name of this ItemMirror if the
   * localItemURI is not given, else uses given localItemURI. Always
   * truncated to 50 characters.
   *
   * ONLY SUPPORTS SIMPLE PHANTOM ASSOCIATION TO ASSOCIATION WITH GROUPING ITEM
   *
   * Throws NullArgumentException when options is null. <br/>
   * Throws MissingParameterException when options is not null and a required
   * argument is missing.<br/>
   * Throws InvalidTypeException if GUID is not a string, and if callback
   * is not a function. <br/>
   * Throws InvalidState if the association with the given GUID cannot be
   * upgraded. <br/>
   *
   * @method upgradeAssociation
   *
   * @param {Object} options Data to construct a new ItemMirror with
   *
   *  @param {String} options.GUID of the association to be upgraded. Required
   *
   *  @param {String} options.localItemURI URI of the local item to be used if
   *                  a truncated display name is not the intended behavior.
   *                  Optional.
   *
   * @param {Function} callback Function to execute once finished.
   *
   *  @param {String}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.upgradeAssociation = function (options, callback) {
    var self = this, localItemURI;
    XooMLUtil.checkCallback(callback);
    if (!XooMLUtil.hasOptions(_UPGRADE_ASSOCIATION_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    if ((options.hasOwnProperty("localItemURI") &&
      !XooMLUtil.isString(options.localItemURI)) ||
      !XooMLUtil.isGUID(options.GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    if (options.hasOwnProperty("localItemURI")) {
      self._setSubGroupingItemURIFromDisplayText(options.GUID, options.localItemURI, callback);
    } else {
      self.getAssociationDisplayText(options.GUID, function (error, displayText) {
        if (error) {
          return callback(error);
        }
        self._setSubGroupingItemURIFromDisplayText(options.GUID, displayText, callback);
      });
    }
  };

  /**
   * Renames the local item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not a function. <br/>
   *
   * @method renameLocalItem
   *
   * @param {String} GUID GUID of the association.
   * @param {String} String String Name you want to rename the file to (including file extension)
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.renameLocalItem = function (GUID, newName, callback) {
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    
    self.getAssociationLocalItemName(GUID, function (error, localItem) {
      if (error) {
        return callback(error);
      }
        //phantom case
        if (!localItem) {
          return callback(error);
        }
        self._handleDataWrapperRenameAssociation(GUID, localItem, newName, error, callback);
    });
  };

  /**
   * Checks if an association's associatedItem is a grouping item
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not an function. <br/>
   *
   * @method isAssociatedItemGrouping
   * @return {Boolean} True if the association with the given GUID's associatedItem is a grouping
   * item, otherwise false.
   *
   * @param GUID {String} GUID of the association to be to be checked.
   *
   */
  self.isAssociatedItemGrouping = function (GUID) {
    var self = this, associatedItem, xooMLFragment, path;

    associatedItem = self._fragmentEditor.getAssociatedItemOfAssociation(GUID);
    if (!associatedItem || associatedItem === "") {
      return false;
    }
      
    xooMLFragment = self._fragmentEditor.getAssociationAssociatedXooMLFragment(GUID);
    if (!xooMLFragment || xooMLFragment === "" || xooMLFragment === null) {
      return false;
    }else{
      return false;
    }
  };
  
  /**
   * Checks if the Association is a grouping item, by checking if it has an Associated XooML Fragment.
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not an function. <br/>
   *
   * @method isGroupingItem
   * @return {Boolean} True if the association with the given GUID is a grouping
   * item, otherwise false.
   *
   * @param GUID {String} GUID of the association to be to be checked.
   *
   * @param {Function} callback Function to execute once finished.
   *
   *  @param {Object} callback.error Null if no error has occurred
   *                  in executing this function, else an contains
   *                  an object with the error that occurred.
   *
   *  @param {Boolean} callback.isGroupingItem True if the association
   *                   with the given GUID is a grouping item, else
   *                   false.
   */
  self.isGroupingItem = function (GUID, callback) {
    var self = this;
      
      self._fragmentEditor.getAssociationAssociatedXooMLFragment(GUID,
        function (error, XooMLFragment){
          if(error){
            return callback(error);
          }
          if (!XooMLFragment || XooMLFragment === "" || XooMLFragment === null) {
            return callback(false, false);
          }else{
          return callback(false, true);
          }
        });
  };

  /**
   * Lists the GUIDs of each association.
   *
   * @method listAssociations
   *
   * @return {String[]} Array of the GUIDs of each association
   *                    of the given namespaceURI
   */
  self.listAssociations = function () {
    var self = this;

    return self._fragmentEditor.listAssociations();
  };

  /**
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceAttribute
   * @return {String} The association namespace attribute with
   * the given attributeName and the given namespaceURI within the
   * association with the given GUID.
   *
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} GUID          GUID of the association to return attribute from.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  self.getAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI) {
    var self = this;

    return self._fragmentEditor.getAssociationNamespaceAttribute(attributeName, GUID, namespaceURI);
  };

  /**
   * Adds the given attributeName to the association with the given GUID and
   * namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   * Throws an InvalidStateException when the given attributeName has already
   * been added. <br/>
   *
   * @method addAssociationNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   */
  self.addAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI) {
    var self = this;

    return self._fragmentEditor.addAssociationNamespaceAttribute(attributeName, GUID, namespaceURI);
  };

  /**
   * Removes the given attributeName to the association with the given GUID and
   * namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   * Throws an InvalidStateException when the given attributeName is not an
   * attribute. <br/>
   *
   * @method removeAssociationNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  self.removeAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI) {
    var self = this;

    self._fragmentEditor.removeAssociationNamespaceAttribute(attributeName, GUID, namespaceURI);
  };

  /**
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method hasAssociationNamespace
   * @return {Boolean} True if the association has the given
   * namespaceURI, else false.
   *
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  self.hasAssociationNamespace = function (GUID, namespaceURI) {
    var self = this;

    return self._fragmentEditor.hasAssociationNamespace(GUID, namespaceURI);
  };

  /**
   * Sets the association namespace attribute with the given attributeName
   * and the given namespaceURI within the association with the given GUID.
   *
   * Throws NullArgumentException if attributeName, attributeValue, GUID, or
   * namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName, attributeValue, GUID, or
   * namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationNamespaceAttribute
   *
   * @param {String} attributeName  Name of the attribute to be set.
   * @param {String} attributeValue Value of the attribute to be set
   * @param {String} GUID           GUID of association to set attribute for.
   * @param {String} namespaceURI   URI of the namespace for the association.
   *
   */
  self.setAssociationNamespaceAttribute = function (attributeName, attributeValue, GUID, namespaceURI) {
    var self = this;

    self._fragmentEditor.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, namespaceURI);

  };

  /**
   *
   * Throws NullArgumentException if GUID, namespaceURI is null. <br/>
   * Throws InvalidTypeException if GUID, namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method listAssociationNamespaceAttributes
   * @return {String[]} An array of the association namespace
   * attributes with the given attributeName and the given
   * namespaceURI within the association with the given GUID.
   *
   * @param {String} GUID          GUID of association to list attributes for.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  self.listAssociationNamespaceAttributes = function (GUID, namespaceURI) {
    var self = this;

    return self._fragmentEditor.listAssociationNamespaceAttributes(GUID, namespaceURI);
  };

  /**
   *
   * Throws NullArgumentException if GUID, namespaceURI is null. <br/>
   * Throws InvalidTypeException if GUID, namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceData
   * @return {String} The association namespace data for an
   * association with the given GUID and the given namespaceURI.
   *
   * @param {String} GUID          GUID of the association namespace data to
   *                               returned.
   * @param {String} namespaceURI  URI of the namespace of the association
   *                               namespace data to returned.
   */
  self.getAssociationNamespaceData = function (GUID, namespaceURI) {
    var self = this;

    return self._fragmentEditor.getAssociationNamespaceData(GUID, namespaceURI);
  };

  /**
   * Sets the association namespace data for an association with the given GUID
   * and given namespaceURI using the given data.
   *
   * Throws NullArgumentException if data, GUID, or namespaceURI is null. <br/>
   * Throws InvalidTypeException if data, GUID, or namespaceURI is not a
   * String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationNamespaceData
   *
   * @param {String} data          Association namespace data to set. Must be
   *                               valid fragmentNamespaceData.
   * @param {String} GUID          GUID of the association namespace data to set.
   * @param {String} namespaceURI  URI of the namespace of the association
   *                               namespace data to set.
   *
   */
  self.setAssociationNamespaceData = function (data, GUID, namespaceURI) {
    var self = this;

    self._fragmentEditor.setAssociationNamespaceData(data, GUID, namespaceURI);
  };

  /**
   * Uses the specified ItemDriver and SyncDriver to synchronize the
   * local ItemMirror object changes. This is an implmentation of Synchronization
   * Driver which modifies the XooML Fragment according to the real structure
   * under the item described.
   *
   * @method sync
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.sync = function (callback) {
    var self = this;

    self._syncDriver.sync(callback);
  };

  /**
   * Checks the local GUID and the remote GUID to see if the local fragment
   * is out of date with the remote fragment.
   *
   * @method isCurrent
   * @return {Boolean} True if the local GUID matches the remote GUID,
   * else false.
   * @async
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {Boolean}  callback.isCurrent True if the local GUID matches
   *                    the remote GUID, else false.
   */
  self.isCurrent = function (callback) {
    var self = this, inMemoryGUID, fileGUID, xooMLFragmentURI;

    inMemoryGUID = self._getguidgeneratedonlastwrite();

    xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);
    self._xooMLDriver.getXooMLFragment(xooMLFragmentURI, function (error,content) {
      if (error) {
        return callback(error);
      }
      new FragmentEditor({ xooMLFragmentString: content }, function (error, tempDataWrapper) {
	callback(false, inMemoryGUID === tempDataWrapper._getguidgeneratedonlastwrite() );
      });
    });
  };

  /**
   * Reloads the XooML Fragment
   *
   * @method refresh
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.refresh = function (callback) {
    var self = this, xooMLFragmentPath;

    self.isCurrent(function (error, isCurrent) {
      if (error) {
        throw error;
      }

      if (isCurrent) {
        return callback(false);
      } else {
        xooMLFragmentPath = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);
        self._loadXooMLFragmentString(xooMLFragmentPath, callback);
      }
    });
  };

  /**
   * @method toString
   * @return {String} String representation of self
   *
   */
  self.toString = function () {
    var self = this;

    return self._fragmentEditor.toString();
  };

  /**
   * @method getParent
   * @return {Object} Parent ItemMirror if this ItemMirror has a parent.
   *
   */
  self.getParent = function () {
    var self = this;

    return self._parent;
  };

  /**
   * Given a GUID and displayText this will create a grouping item
   * based on the displayText for that item.
   *
   * @method _setSubGroupingItemURIFromDisplayText
   *
   * @param {String} GUID
   * @param {String} displayText
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._setSubGroupingItemURIFromDisplayText = function (GUID, displayText, callback) {
    var self = this, length, subGroupingItemURI, path;

    length = displayText.length <= XooMLConfig.maxFileLength ?
      displayText.length : XooMLConfig.maxFileLength;
    subGroupingItemURI = displayText.substring(0, length);
    path = PathDriver.joinPath(self._groupingItemURI, subGroupingItemURI);

    self._itemDriver.createGroupingItem(path, function (error) {
      if (error) {
        return callback(error);
      }
      self._setAssociationLocalItemAndAssociatedItem(GUID, subGroupingItemURI, callback);
    });
  };

  /**
   *
   * @method getGUIDGeneratedOnLastWrite
   * @return {String} The GUID generated on the last modification to the file.
   * @private
   */
  self._getGUIDGeneratedOnLastWrite = function () {
    var self = this;

    return self._fragmentEditor.getGUIDGeneratedOnLastWrite();
  };

  /**
   * Sets the associated and local item for the association to the
   * same itemURI passed in.
   *
   * @method _setAssociationLocalItemAndAssociatedItem
   *
   * @param {String} GUID
   * @param {String} itemURI
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self._setAssociationLocalItemAndAssociatedItem = function (GUID, itemURI, callback) {
    var self = this;

    self._fragmentEditor.setAssociationLocalItem(GUID, itemURI, function (error) {
      if (error) {
        return callback(error);
      }
      self._fragmentEditor.setAssociationAssociatedItem(GUID, itemURI, function (error) {
        if (error) {
          return callback(error);
        }
        self._save(callback);
      });
    });
  };

  /**
   * Checks to see if the fragment is current, and if it isn't, then
   * save it.
   *
   * @method _save
   * 
   *
   * @param {String} GUID
   * @param {String} itemURI
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._save = function (callback) {
    var self = this;

    self.isCurrent(function (error, isCurrent) {
      if (error) {
        return callback(error);
      }
      if (!isCurrent) {
        return callback(XooMLExceptions.itemMirrorNotCurrent);
      }
      self._saveFragment(callback);
    });
  };

  /**
   * Saves the fragment
   *
   * @method _saveFragment
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._saveFragment = function (callback) {
    var self = this;

    self._fragmentEditor.updateETag(function (error, GUID) {
      if (error) {
        return callback(error);
      }

      self._fragmentEditor.toString(function (error, toString) {
        if (error) {
          return callback(error);
        }
        var xooMLFragmentPath = PathDriver.joinPath(self._groupingItemURI,
          XooMLConfig.xooMLFragmentFileName);

        self._xooMLDriver.setXooMLFragment(xooMLFragmentPath, toString,
          function (error) {
            if (error) {
              return callback(error);
            }

            callback(false);
          });
      });
    });
  };

  /**
   * Sets the item driver specified in the options for the XooMLFragment.
   *
   * @method _getItemU
   *
   * @param {String} xooMLFragmentURI
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._getItemU = function (xooMLFragmentURI, options, callback) {
    var self = this;

    self._itemDriver = new ItemDriver(options.itemDriver, function (error, itemU) {
      if (error) {
        return callback(error, null);
      }

      self._itemDriver = itemU;

      if (XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_2_AND_3_OPTIONS, options)) {
        if (options.readIfExists) {
          self._getItemUForFallbackConstructor(xooMLFragmentURI, options, callback);
        } else {
          self._getItemUNewXooMLFragment(xooMLFragmentURI, options, callback);
        }
      } else if (XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_1_OPTIONS, options)) {
        self._loadXooMLFragmentString(xooMLFragmentURI, callback);
      }
    });
  };

  /**
   * Creates a sync driver
   *
   * @method _createSyncDriver
   * @return The sync driver
   * @private
   */
  self._createSyncDriver = function () {
    var self = this;

    return new SyncDriver(self);
  };

  /**
   * Sets the item driver specified in the options for the XooMLFragment.
   *
   * @method _loadXooMLFragmentString
   *
   * @param {Function} uri URI for the XooMLFragment
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._loadXooMLFragmentString = function (uri, callback) {
    var self = this;

    self._xooMLDriver.getXooMLFragment(uri, function (error, content) {
      if (error) {
        return callback(error, null);
      }

      new FragmentEditor({
        xooMLFragmentString: content
      }, function (error, fragmentWrapper) {
        if (error) {
          return callback(error);
        }

        self._fragmentEditor = fragmentWrapper;
        self._syncDriver = self._createSyncDriver();

        self.sync(function (error) {
          if (error) {
            throw error;
          }

          return callback(false, self);
        });
      });
    });
  };

  /**
   * Uses itemDriver to retrieve a list of items and creates
   * corresponding XooMLFragments for the retrieved items in the list
   *
   * @method getItemList
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._getItemList = function (options, callback) {
    var self = this;

    self._itemDriver.listItems(self._groupingItemURI, function (error, list) {
      if (error) {
        return callback(error, null);
      }

      self._createXooMLFragment(options, list, callback);
    });
  };

  /**
   * Given a list of associations this will create a new XooMLFragment
   * with all of the assocations in the given list. The fragment will
   * also be saved.
   *
   * @method _createXooMLFragment
   * @param {Object} options
   * @param {String[]} list Associations
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createXooMLFragment = function (options, list, callback) {
    var self = this, fragmentWrapperOptions;

    fragmentWrapperOptions = {
      associations:    list,
      xooMLUtilityURI: options.xooMLDriver.driverURI,
      itemUtilityURI:  options.itemDriver.driverURI,
      syncUtilityURI:  options.syncDriver.driverURI,
      groupingItemURI: options.groupingItemURI
    };

    new FragmentEditor(fragmentWrapperOptions, function (error, fragmentWrapper) {
      if (error) {
        return callback(error, null);
      }

      self._fragmentEditor = fragmentWrapper;
      self._syncDriver = self._createSyncDriver();
      self._saveFragment(callback);
    });
  };

  /**
   * Given an association, this will delete the association, whether
   * it's a grouping item or isn't. The item is then saved.
   *
   * @method _handleExistingAssociationDelete
   * @param {String} GUID
   * @param {String} item
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleExistingAssociationDelete = function (GUID, item, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, item);

    self._itemDriver.isGroupingItem(path, function (error, result) {
      if (error) {
        return callback(error, null);
      }

      if (result === true) {
        self._removeNonGroupingItemThroughAssociation(GUID, item, callback);
      } else {
        self._removeGroupingItemThroughAssociation(GUID, item, callback);
      }
    });
  };
  
  /**
   * TODO: Document. Purpose and usage unknown as of 7/3/2014
   *
   * @method _handleExistingAssociationCopy
   * @param {String} GUID
   * @param {String} item
   * @param {Object} ItemMirror
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleExistingAssociationCopy = function (GUID, item, ItemMirror, callback) {
    var self = this, pathFrom, pathTo;

    pathFrom = PathDriver.joinPath(self._groupingItemURI, item);
    pathTo = PathDriver.joinPath(ItemMirror._groupingItemURI, item);
    
    self._itemDriver.copyItem(pathFrom, pathTo, function(error){
      if (error) {
        return self._handleSet(error, callback);
      }
        return callback(false);
    });
  };
  
  /**
   * TODO: Document. Purpose and usage unknown as of 7/3/2014
   *
   * @method _handleExistingAssociationMove
   * @param {String} GUID
   * @param {String} item
   * @param {Object} ItemMirror
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleExistingAssociationMove = function (GUID, item, ItemMirror, callback) {
    var self = this, pathFrom, pathTo;

    pathFrom = PathDriver.joinPath(self._groupingItemURI, item);
    pathTo = PathDriver.joinPath(ItemMirror._groupingItemURI, item);
    
    self._itemDriver.moveItem(pathFrom, pathTo, function(error){
      if (error) {
        return self._handleSet(error, callback);
      }
       return callback(false);
    });
  };
  
  /**
   * TODO: Document. Purpose and usage unknown as of 7/3/2014
   *
   * @method _handleExistingAssociationRename
   * @param {String} GUID
   * @param {String} item
   * @param {Object} ItemMirror
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleExistingAssociationRename = function (GUID, item1, item2, callback) {
    var self = this, pathFrom, pathTo;

    pathFrom = PathDriver.joinPath(self._groupingItemURI, item1);
    pathTo = PathDriver.joinPath(self._groupingItemURI, item2);
    
    self._itemDriver.moveItem(pathFrom, pathTo, function(error){
      if (error) {
        return self._handleSet(error, callback);
      }
       return callback(false);
    });
  };

  /**
   * Removes a non grouping item based on it's assocation. Must pass
   * in a non grouping item, or errors will be thrown.
   *
   * @method _removeNonGroupingItemThroughAssociation
   * @param {String} GUID
   * @param {String} item
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._removeNonGroupingItemThroughAssociation = function (GUID, item, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, item);

    self._itemDriver.deleteNonGroupingItem(path, function (error) {
      self._handleSet(error, callback);
    });
  };

  /**
   * Removes a grouping item based on it's assocation. Must pass
   * in a grouping item, or errors will be thrown.
   *
   * @method _removeGroupingItemThroughAssociation
   * @param {String} GUID
   * @param {String} item
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._removeGroupingItemThroughAssociation = function (GUID, item, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, item);

    self._itemDriver.deleteGroupingItem(path, function (error) {
      self._handleSet(error, callback);
    });
  };

  self._handleSet = function (error, callback) {
    if (error) {
      return callback(error, null);
    }
    var self = this;

    self._save(callback);
  };

  /**
   * Retrieves a fallback constructor for XooML Driver
   *
   * @method _getItemUForFallbackConstructor
   * @param {String} xooMLFragmentURI
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._getItemUForFallbackConstructor = function (xooMLFragmentURI, options, callback) {
    var self = this;

    self._xooMLDriver.checkExisted(xooMLFragmentURI, function (error, result) {
      if (result === true) {
        self._loadXooMLFragmentString(xooMLFragmentURI, callback);
      } else {
        self._getItemList(options, callback);
      }
    });
  };

  /**
   * Creates new XooML Fragment for an already existing item. For
   * instance, in dropbox's case, it would look at a folder, and then
   * create a new fragment, with the associations being all of the
   * items in that folder.
   *
   * @method _getItemUNewXooMLFragment
   * @param {String} xooMLFragmentURI
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._getItemUNewXooMLFragment = function (xooMLFragmentURI, options, callback) {
    var self = this;

    self._xooMLDriver.checkExisted(xooMLFragmentURI, function (error, result) {
      // TODO handle error for already existing file, throw others

      if (result === true) {
        return callback(XooMLExceptions.itemAlreadyExists);
      } else {
        self._getItemList(options, callback);
      }
    });
  };

  /**
   * Takes care of case 1.
   *
   * @method _createAssociationSimple
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationSimple = function (GUID, options, callback) {
    var self = this;
    
    // Case 1
    return self._save(function (error) {
      return callback(error, GUID);
    });
  };

  /**
   * Takes care of cases 2 and 3. Only case 2 appears to be implemented.
   *
   * @method _createAssociationLinkNonGrouping
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationLinkNonGrouping = function (GUID, options, callback) {
    var self = this;

    if (!options.localItemRequested) {
      // Case 2
      return self._save(function (error) {
        return callback(error, GUID);
      });
    } else {
      // Case 3
      return callback(XooMLExceptions.notImplemented);
    }
  };

  /**
   * Takes care of cases 4 and 5. Neither are implemented.
   *
   * @method _createAssociationLinkGrouping
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationLinkGrouping = function (GUID, options, callback) {
    var self = this;

    if (!options.localItemRequested) {
      // Case 4
    } else {
      // Case 5
    }
      
    return callback(XooMLExceptions.notImplemented);
  };

  /**
   * Takes care of cases 6 and 7.
   *
   * @method _createAssociationLinkGrouping
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationCreate = function (GUID, options, callback) {
    var self = this;

    if (!options.isGroupingItem) {
      return self._createAssociationNonGroupingItem(GUID, options, callback); // Case 6
    } else {
      return self._createAssociationGroupingItem(GUID, options, callback); // Case 7
    }
  };

  /**
   * Creates an association grouping item and then saves that association
   *
   * @method _createAssociationGroupingItem
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationGroupingItem = function (GUID, options, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, options.itemName);

    self._itemDriver.createGroupingItem(path, function (error, stat) {
      if (error || stat.name !== options.itemName) {
        return callback(error, null);
      }

      return self._saveAssociationAssociatedXooMLFragment(GUID, options, callback);
    });
  };

  /**
   * Saves the association
   *
   * @method _saveAssociationAssociatedXooMLFragment
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._saveAssociationAssociatedXooMLFragment = function (GUID, options, callback) {
    var self = this;

    self._fragmentEditor.setAssociationAssociatedXooMLFragment(GUID,
      XooMLConfig.xooMLFragmentFileName, function (error) {
      if (error) {
        return callback(error);
      }

      self._save(function (error) {
        callback(error, GUID);
      });
    });
  };

  /**
   * Creates an association non grouping item and saves it.
   *
   * @method _createAssociationNonGroupingItem
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createAssociationNonGroupingItem = function (GUID, options, callback) {
    var self = this;

    self._checkExistenceFromItemDescribed(function (error, result) {
      if (error) {
        return callback(error, null);
      }

      if (result) {
        return callback(XooMLExceptions.itemUException);
      } else {
        self._createNonGroupingItemFromItemDescribed(GUID, options, callback);
      }
    });
  };

  /**
   * Creates an association non grouping item based off of the name
   * specified in options and saves it.
   *
   * @method _createNonGroupingItemFromItemDescribed
   * @param {String} GUID
   * @param {Object} options
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._createNonGroupingItemFromItemDescribed = function (GUID, options, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, options.itemName);

    self._itemDriver.createNonGroupingItem(path, "", function (error, stat) {
      if (error || stat.name === options.itemName) {
        return callback(error, null);
      }

      self._save(function (error) {
        callback(error, GUID);
      });
    });
  };

  /**
   * Checks to see whether the given item exists based on the name
   * provided.
   *
   * @method _checkExistenceFromItemDescribed
   * @param {String} itemName
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._checkExistenceFromItemDescribed = function (itemName, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, itemName);

    self._itemDriver.checkExisted(path, function (error, result) {
      if (error) {
        return callback(error, null);
      }

      return callback(error, result, self._groupingItemURI);
    });
  };

  /**
   * Helps to handle whether assoiations should be deleted. Not
   * entirely sure about the utility of this function, it looks like
   * something that should be handled by the sync driver.
   *
   * @method _handleDataWrapperDeleteAssociation
   * @param {String} GUID
   * @param {String} localItem
   * @param {Object} error
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleDataWrapperDeleteAssociation = function (GUID, localItem, error, callback) {
    var self = this, path;
    if (error) {
      return callback(error);
    }

    path = PathDriver.joinPath(self._groupingItemURI, localItem);

    self._itemDriver.checkExisted(path, function (error, result) {
      if (error) {
        return callback(error);
      }

      if (result === true) {
        return self._handleExistingAssociationDelete(GUID, localItem, callback);
      } else {
        // file that should exist does not
        return callback(XooMLExceptions.invalidState);
      }
    });
  };
  
  /**
   * Purpose unknown
   *
   * @method _handleDataWrapperCopyAssociation
   * @param {String} GUID
   * @param {String} localItem
   * @param {Object} itemMirror
   * @param {Object} error
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleDataWrapperCopyAssociation = function (GUID, localItem, ItemMirror, error, callback) {
    var self = this, path;
    if ((error)) {
      return callback(error);
    }
    
    path = PathDriver.joinPath(self._groupingItemURI, localItem);
    
    self._itemDriver.checkExisted(path, function (error, result) {
      if (error) {
        return callback(error);
      }

      if (result === true) {
        return self._handleExistingAssociationCopy(GUID, localItem, ItemMirror, callback);
      } else {
        // file that should exist does not
        return callback(XooMLExceptions.invalidState);
      }
    });
  };
  
  /**
   * Purpose unknown
   *
   * @method _handleDataWrapperMoveAssociation
   * @param {String} GUID
   * @param {String} localItem
   * @param {Object} itemMirror
   * @param {Object} error
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleDataWrapperMoveAssociation = function (GUID, localItem, ItemMirror, error, callback) {
    var self = this, path;
    if ((error)) {
      return callback(error);
    }
    
    path = PathDriver.joinPath(self._groupingItemURI, localItem);
    
    self._itemDriver.checkExisted(path, function (error, result) {
      if (error) {
        return callback(error);
      }

      if (result === true) {
        return self._handleExistingAssociationMove(GUID, localItem, ItemMirror, callback);
      } else {
        // file that should exist does not
        return callback(XooMLExceptions.invalidState);
      }
    });
  };
  
  /**
   * Purpose unknown
   *
   * @method _handleDataWrapperRenameAssociation
   * @param {String} GUID
   * @param {String} localItem
   * @param {Object} itemMirror
   * @param {Object} error
   * @param {Function} callback
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  self._handleDataWrapperRenameAssociation = function (GUID, localItem, newName, error, callback) {
    var self = this, path;
    if ((error)) {
      return callback(error);
    }
    
    path = PathDriver.joinPath(self._groupingItemURI, localItem);
    
    self._itemDriver.checkExisted(path, function (error, result) {
      if (error) {
        return callback(error);
      }

      if (result === true) {
        return self._handleExistingAssociationRename(GUID, localItem, newName, callback);
      } else {
        // file that should exist does not
        return callback(XooMLExceptions.invalidState);
      }
    });
  };

/**
 * Checks if the AssociatedItem String passed into it is a URL or not.
 *
 * @method _isURL
 * @return {Boolean} True if it is an HTTP URL, false otherwise
 * (HTTPS will fail)
 * @private
 * @param {String} URL
 */
  self._isURL = function (URL){
    return /^http:\/\//.exec(URL);
  };

  return ItemMirror;
});
