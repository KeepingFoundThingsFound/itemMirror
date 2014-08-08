/**
 * ItemMirror represents an Item according to the XooML2 specification.
 *
 * It can be instantiated using one of the following two cases based on the
 * given arguments.
 *
 * 1. XooMLFragment already exists. Given xooMLFragmentURI and xooMLDriver.
 * 2. The XooMLFragment is created from an existing groupingItemURI (e.g., a dropbox folder).
 * Given a groupingItemURI, itemDriver, and a xooMLDriver a new itemMirror will be constructed for given groupingItemURI.
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
 *                  construct ItemMirror with. Required for cases 2 & 3
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
  './XooMLExceptions',
  './XooMLConfig',
  './XooMLUtil',
  './PathDriver',
  './ItemDriver',
  './XooMLDriver',
  './SyncDriver',
  './FragmentEditor'
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  ItemDriver,
  XooMLDriver,
  SyncDriver,
  FragmentEditor) {
  "use strict";

  var
    _CONSTRUCTOR_CASE_1_OPTIONS = {
      "groupingItemURI":  true,
      "xooMLDriver":      true,
      "parent":           false
    },
    _CONSTRUCTOR_CASE_2_OPTIONS = {
      "groupingItemURI": true,
      "xooMLDriver":     true,
      "itemDriver":      true,
      "syncDriver":      true,
      "parent":          false
    },
    _UPGRADE_ASSOCIATION_OPTIONS = {
      "GUID": true,
      "localItemURI": false
    };

  function ItemMirror(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_2_OPTIONS, options) &&
      !XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_1_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    var self = this, xooMLFragmentURI, displayName;

    // private variables
    self._xooMLDriver = null;
    self._itemDriver = null;
    self._syncDriver = null;
    self._parent = options.parent;
    self._groupingItemURI = PathDriver.formatPath(options.groupingItemURI);
    self._newItemMirrorOptions = options;

    // displayName for the fragment
    if (PathDriver.isRoot(self._groupingItemURI)) {
      displayName = "";
    } else {
      displayName = PathDriver.formatPath(self._groupingItemURI);
      displayName = PathDriver.splitPath(displayName);
      displayName = displayName[displayName.length - 1];
    }

    function loadXooMLDriver(error, driver) {
      var syncDriverURI, itemDriverURI;
      if (error) return callback(error);

      self._xooMLDriver = driver; // actually sets the XooMLDriver

      self._xooMLDriver.checkExists(function check(error, exists) {
        if (error) return callback(error);

        // Case 1: It already exists, and so all of the information
        // can be constructed from the saved fragment
        if (exists) {
          self._xooMLDriver.getXooMLFragment(function load(error, fragmentString) {
            if (error) return callback(error);

            self._fragment = new FragmentEditor({text: fragmentString});

            // Need to load other stuff from the fragment now
            syncDriverURI = self._fragment.commonData.syncDriver;
            itemDriverURI = self._fragment.commonData.itemDriver;

            new ItemDriver(options.itemDriver, function(error, driver) {
              if (error) return callback(error);
              self._itemDriver = driver;
              return callback(false, self);
            });
          });
        } else { // Case 2: Since the fragment doesn't exist, we need
                 // to construct that by using the itemDriver
          new ItemDriver(options.itemDriver, function loadItemDriver(error, driver) {
            self._itemDriver = driver;

            self._itemDriver.listItems(self._groupingItemURI, function buildFragment(error, associations){
              if (error) return callback(error);
              self._fragment = new FragmentEditor({
                commonData: {
                  itemDescribed: self._groupingItemURI,
                  displayName: displayName,
                  itemDriver: "dropboxItemDriver",
                  xooMLDriver: "dropboxXooMLDriver",
                  syncDriver: "itemMirrorSyncUtility"
                },
                namespace: self._namespace,
                associations: associations
              });

              // Finally load the SyncDriver, which for now doesn't really do anything
              self._syncDriver = new SyncDriver(self);

              return callback(false, self);
            });
          });
        }
      });
    }

    xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);
    options.xooMLDriver.fragmentURI = xooMLFragmentURI;
    // First load the XooML Driver
    new XooMLDriver(options.xooMLDriver, loadXooMLDriver);

    // Then load the ItemDriver
  }

  /**
   * @method getDisplayName
   * @return {String} The display name of the fragment.
   */
  ItemMirror.prototype.getDisplayName = function() {
    return this._fragment.commonData.displayName;
  };

  /**
   *
   * @method getSchemaVersion
   * @return {String} XooML schema version.
   */
  ItemMirror.prototype.getSchemaVersion = function(callback) {
    return this._fragment.commonData.schemaVersion;
  };

  /**
   *
   * @method getSchemaLocation
   * @return {String} XooML schema location.
   */
  ItemMirror.prototype.getSchemaLocation = function() {
    return this._fragment.commonData.schemaLocation;
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
    ItemMirror.prototype.getURIforItemDescribed = function() {
    return this._fragment.commonData.itemDescribed;
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
   * @param {String} GUID GUID representing the desired association.
   */
    ItemMirror.prototype.getAssociationDisplayText = function(GUID) {
    return this._fragment.associations[GUID].commonData.displayText;
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
    ItemMirror.prototype.setAssociationDisplayText = function(GUID, displayText) {
    this._fragment.associations[GUID].commonData.displayText = displayText;
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationLocalItem
   * @return {String} The local item for the association with the given GUID.
   *
   * @param {String} GUID GUID of the association to get.
   */
    ItemMirror.prototype.getAssociationLocalItem = function(GUID) {
    return this._fragment.associations[GUID].commonData.localItem;
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationAssociatedItem
   * @return {String} The associated item for the association with the given GUID.
   * @param {String} GUID GUID of the association to get.
   */
    ItemMirror.prototype.getAssociationAssociatedItem = function(GUID) {
    return this._fragment.associations[GUID].commonData.associationAssociatedItem;
  };

  /**
   * @method getFragmentNamespaceAttribute
   * @return {String} Returns the value of the given attributeName for the
   * fragmentNamespaceData with the given namespaceURI.
   * @param {String} attributeName Name of the attribute to be returned.
   *
   */
  ItemMirror.prototype.getFragmentNamespaceAttribute = function(attributeName) {
    return this._fragment.namespace.attributes[attributeName];
  };

  /**
   * Adds the given attributeName to the fragment's current namespace
   *
   * Throws an InvalidStateException when the attribute already exists
   *
   * @method addFragmentNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   */
  // TODO: Possibly remove? Why not just get and set
  ItemMirror.prototype.addFragmentNamespaceAttribute = function(attributeName) {
    if (this._fragment.namespace.attributes[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setFragmentNamespaceAttribute(attributeName);
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
   */
  ItemMirror.prototype.removeFragmentNamespaceAttribute = function(attributeName) {
    this._setFragmentNamespaceAttribute(attributeName, null);
  };

  /**
   * Checks if the fragment has the given namespaceURI.
   *
   * Currently cannot find a way to list the namespaces (no DOM
   * standard method for doing so). So this fuction will ALWAYS RETURN
   * FALSE for now.
   *
   * @method hasFragmentNamespace
   * @return {Boolean} True if the fragment has the given
   * namespaceURI, otherwise false.
   *
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  ItemMirror.prototype.hasFragmentNamespace = function (namespaceURI) {
    return false;
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
   */
  ItemMirror.prototype.setFragmentNamespaceAttribute = function(attributeName, attributeValue) {
    this._fragment.namespace.attributes[attributeName] = attributeValue;
  };

  /**
   * @method listFragmentNamespaceAttributes
   * @return {String[]} An array of the attributes within the
   * fragmentNamespaceData with the given namespaceURI.
   *
  */
  ItemMirror.prototype.listFragmentNamespaceAttributes = function() {
    return Object.keys(this._fragment.namespace.attributes);
  };

  /**
   * @method getFragmentNamespaceData
   * @return {String} The fragment namespace data with the given namespaceURI.
   */
  ItemMirror.prototype.getFragmentNamespaceData = function() {
    return this._fragment.namespace.data;
  };

  /**
   * Sets the fragment namespace data with the given namespaceURI.
   *
   * @method setFragmentNamespaceData
   *
   * @param {String} data Fragment namespace data to be set. Must be valid
   *                 namespaceData.
   * @param {String} namespaceURI URI of the namespace to be set.
   */
  ItemMirror.prototype.setFragmentNamespaceData = function (data) {
    this._fragment.namespace.data = data;
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
  ItemMirror.prototype.createItemMirrorForAssociatedGroupingItem = function (GUID, callback) {
    var self = this;

    self.isAssociationAssociatedItemGrouping(GUID, function (error, isGrouping) {
      if (error) {
        return callback(error);
      }
      if (!isGrouping) {
        return callback(false, null);
      }

      self._fragmentEditor.getAssociationAssociatedItem(GUID, function (error, associatedItem) {
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

            self._sync(function (error) {
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
  ItemMirror.prototype.createAssociation = function (options, callback) {
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
   * Duplicates (copies) an association to another ItemMirror Object (representing a grouping item)
   *
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method copyAssociation
   *
   * @param {String} GUID GUID of the association you wish to copy/duplicate
   * @param {ItemMirror} ItemMirror ItemMirror representing the grouping item you want to move the GUID object to
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   ItemMirror.prototype.copyAssociation = function (GUID, ItemMirror, callback) {
    var self = this;

    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.getAssociationLocalItem(GUID, function (error, localItem) {
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
            self.getAssociationAssociatedItem(GUID, function(error, associatedItem){
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
   ItemMirror.prototype.moveAssociation = function (GUID, ItemMirror, callback) {
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.getAssociationLocalItem(GUID, function (error, localItem) {
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
            self.getAssociationAssociatedItem(GUID, function(error, associatedItem){
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
  ItemMirror.prototype.deleteAssociation = function (GUID, callback) {
    var self = this;

    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.getAssociationLocalItem(GUID, function (error, localItem) {
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
  ItemMirror.prototype.upgradeAssociation = function (options, callback) {
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
   * @method renameAssocationLocalItem
   *
   * @param {String} GUID GUID of the association.
   * @param {String} String String Name you want to rename the file to (including file extension)
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  ItemMirror.prototype.renameAssocationLocalItem = function (GUID, newName, callback) {
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.getAssociationLocalItem(GUID, function (error, localItem) {
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
   * @method isAssociationAssociatedItemGrouping
   * @return {Boolean} True if the association with the given GUID's associatedItem is a grouping
   * item, otherwise false.
   *
   * @param GUID {String} GUID of the association to be to be checked.
   *
   */
  ItemMirror.prototype.isAssociationAssociatedItemGrouping = function(GUID) {
    return this._fragment.associations[GUID].commonData.isGrouping;
  };

  /**
   * Lists the GUIDs of each association.
   *
   * @method listAssociations
   *
   * @return {String[]} Array of the GUIDs of each association
   *                    of the given namespaceURI
   */
  ItemMirror.prototype.listAssociations = function() {
    return Object.keys(this._fragment.associations);
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
   *
   */
  self.getAssociationNamespaceAttribute = function(attributeName, GUID) {
    return this._fragment.associations[GUID].namespace.attributes[attributeName];
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
   */
  ItemMirror.prototype.addAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID) {
    if (this._fragment.assocation[GUID].namespace[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID);
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
   *
   */
  ItemMirror.prototype.removeAssociationNamespaceAttribute = function(attributeName, GUID) {
    this.setAssociationNamespaceAttribute(attributeName, null, GUID);
  };

  /**
   * Currently cannot list namespaces, so ALWAYS RETURNS FALSE. Need to fix.
   *
   * @method hasAssociationNamespace
   * @return {Boolean} True if the association has the given
   * namespaceURI, else false.
   *
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   */
  ItemMirror.prototype.hasAssociationNamespace = function(GUID) {
    return false;
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
   *
   */
  ItemMirror.prototype.setAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID) {
    this._fragment.associations[GUID].namespace.attributes[attributeName] = attributeValue;
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
   *
   */
  ItemMirror.prototype.listAssociationNamespaceAttributes = function (GUID) {
    return Object.keys(this._fragment.associations[GUID].namespace.attributes);
  };

  /**
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceData
   * @return {String} The association namespace data for an
   * association with the given GUID and the given namespaceURI.
   *
   * @param {String} GUID GUID of the association namespace data to
   * returned.
   */
  self.getAssociationNamespaceData = function (GUID) {
    return this._fragment.associations[GUID].namespace.data;
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
   */
  ItemMirror.prototype.setAssociationNamespaceData = function (data, GUID) {
    this._fragment.assocations[GUID].namespace.data = data;
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
   * @private
   */
  ItemMirror.prototype._sync = function (callback) {
    var self = this;

    self._syncDriver.sync(callback);
  };

  /**
   * Checks the local GUID and the remote GUID to see if the local fragment
   * is out of date with the remote fragment.
   *
   * @method _isCurrent
   * @return {Boolean} True if the local GUID matches the remote GUID,
   * else false.
   * @async
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {Boolean}  callback._isCurrent True if the local GUID matches
   *                    the remote GUID, else false.
   * @private
   */
  self._isCurrent = function (callback) {
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
   * @method getItemMirrorFromWhichThisWasCreated
   *
   * @return {Object} The itemMirror that created this current
   * itemMirror, if it has one. Note that this isn't the same as
   * asking for a 'parent,' since multiple itemMirrors can possibly
   * link to the same one
   *
   */
  self.getItemMirrorFromWhichThisWasCreated = function () {
    var self = this;

    return self._parent;
  };


  /**
   * Saves the itemMirror object, writing it out to the
   * fragment. Fails if the GUID generated on last write for the
   * itemMirror and the XooML fragment don't match.
   *
   * @method save
   *
   * @param callback
   *  @param callback.error Returns false if everything went ok,
   *  otherwise returns the error
   */
  ItemMirror.prototype.save = function(callback) {
    var self = this;

    self._sync( function(error) {
      if (error) return callback(error);
      self._xooMLDriver.getFragment(function(error, content){
        if (error) return callback(error);

        var tmpFragment = new FragmentEditor({text: content});
        if (tmpFragment.commonData.GUIDGeneratedOnLastWrite !==
            self._fragmentEditor.commonData.GUIDGeneratedOnLastWrite) {
          callback(XooMLExceptions.itemMirrorNotCurrent);
        }

        self._xooMLDriver.setFragment(self._fragmentEditor.toString(), function(callback) {
          if (error) callback(error);
        });
      });
    });
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
   * @private
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
