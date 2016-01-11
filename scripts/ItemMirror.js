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
 *  @param {ItemMirror} options.creator If being created from another
 *  itemMirror, specifies that itemMirror which it comes from.
 *
 * @param {Function} callback Function to execute once finished.
 *  @param {Object}   callback.error Null if no error has occurred
 *                    in executing this function, else an contains
 *                    an object with the error that occurred.
 *  @param {ItemMirror} callback.itemMirror Newly constructed ItemMirror
 */

'use strict'

// Note: This is nothing more than the minified version of the older library.
// It's used because the stability of the library is better, even though it's
// more poorly implemented in the first place



var XooMLExceptions = require('./XooMLExceptions');
var XooMLUtil = require('./XooMLUtil');
var XooMLDriver = require('./google-xooml-driver');
var ItemDriver = require('./google-item-driver');
var SyncDriver = require('./SyncDriver');
var FragmentEditor = require('./FragmentEditor');
var AssociationEditor = require('./AssociationEditor');


function ItemMirror(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }

   var self = this, xooMLFragmentURI, displayName;

  if (typeof options === 'string') {
    specialConstruction();
  } else {
    regularConstruction();
  }

    function specialConstruction() {
      // Special case where we return a limited functionality itemMirror object that
      // represents different informational stores
      // A special XooML fragment, representing information stores
      var xml = ['<fragment xmlns="http://kftf.ischool.washington.edu/xmlns/xooml" itemDescribed="/" displayName="Dropbox" itemDriver="dropboxItemDriver" syncDriver="itemMirrorSyncUtility" xooMLDriver="dropboxXooMLDriver" GUIDGeneratedOnLastWrite="771c1026-b8d8-4457-9594-01531b9f7ca0">',
      '<association ID="a02f53d2-18af-4faf-ace9-5305cb808ec5" displayText="Dropbox" associatedItem="Dropbox" isGrouping="true">',
      '</association>',
      '<association ID="27955628-7850-4c71-be12-6caed1c9463c" displayText="Google Drive" associatedItem="gapi" isGrouping="true">',
      '</association>',
      '</fragment>'].join('\n');

      self._fragment = new FragmentEditor({text: xml});
      return callback(false, self);
    }

    function regularConstruction() {
     self._xooMLDriverClient = options.xooMLDriver.clientInterface;
     self._itemDriverClient = options.xooMLDriver.clientInterface;

      // private variables
      self._xooMLDriver = null;
      self._itemDriver = null;
      self._syncDriver = null;
      self._creator = options.creator || null;
      self._groupingItemURI = options.groupingItemURI;
      self._newItemMirrorOptions = options;

      // displayName for the fragment
      // It may make more sense to set this later once we have the drivers loaded
      // displayName = this._xooMLDriver.getDisplayName();
      displayName = 'TBD';

      self.fragmentURI = options.fragmentURI || null;
      options.xooMLDriver.fragmentURI = xooMLFragmentURI;

      // First load the XooML Driver
      new XooMLDriver(options.xooMLDriver, loadXooMLDriver);
    }



    function loadXooMLDriver(error, driver) {
      if (error) return callback(error);

      self._xooMLDriver = driver; // actually sets the XooMLDriver

      self._xooMLDriver.getXooMLFragment(processXooML);
    }

    function processXooML(error, fragmentString) {
      // Case 2: Since the fragment doesn't exist, we need
      // to construct it by using the itemDriver
      if (error === 'XooML Not Found') {
        new ItemDriver(options.itemDriver, createFromItemDriver);
      } else if (error) {
        return callback(error);
      }

      // Case 1: It already exists, and so all of the information
      // can be constructed from the saved fragment
      else {
        createFromXML(fragmentString);
      }
    }

    function createFromXML(fragmentString) {
      self._fragment = new FragmentEditor({text: fragmentString});

      new ItemDriver(options.itemDriver, function(error, driver) {
        if (error) return callback(error);
        self._itemDriver = driver;

        self._syncDriver = new SyncDriver(self);

        // Do a refresh in case something has been added or deleted in
        // the directory since the last write
        self.refresh(function() {
          return callback(false, self);
        });
      });
    }

    function createFromItemDriver(error, driver) {
      self._itemDriver = driver;

      self._itemDriver.listItems(self._groupingItemURI, buildFragment);
    }

    function buildFragment(error, associations){
      if (error) return callback(error);

      self._fragment = new FragmentEditor({
        commonData: {
          itemDescribed: self._groupingItemURI,
          displayName: displayName,
          itemDriver: "dropboxItemDriver",
          xooMLDriver: "dropboxXooMLDriver",
          syncDriver: "itemMirrorSyncUtility"
        },
        associations: associations
      });

      self._syncDriver = new SyncDriver(self);

      // Because the fragment is being built from scratch, it's safe
      // to save it directly via the driver.
      self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
        if (error) {
          throw new Error(error);
        }
      });

      return callback(false, self);
    }
  }

  /**
   * @method getDisplayName
   * @return {String} The display name of the fragment.
   */
  ItemMirror.prototype.getDisplayName = function() {
    return this._fragment.commonData.displayName;
  };

  /**
   * @method setDisplayName
   * @param {String} name The display text to set for the fragment
   */
  ItemMirror.prototype.setDisplayName = function(name) {
    this._fragment.commonData.displayName = name;
  };

  /**
   *
   * @method getSchemaVersion
   * @return {String} XooML schema version.
   */
  ItemMirror.prototype.getSchemaVersion = function() {
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
   * @method getURIforItemDescribed
   * @return {String} A URI pointing to item described by the metadata
   * of a fragment if it exists, else returns null.
   *
   */
  ItemMirror.prototype.getURIforItemDescribed = function() {
    return this._fragment.commonData.itemDescribed;
  };

  ItemMirror.prototype.getPublicURL = function(GUID) {
    return this._fragment.associations[GUID].commonData.publicURL;
  }

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
    return this._fragment.associations[GUID].commonData.associatedItem;
  };

  /**
   * @method getFragmentNamespaceAttribute
   * @return {String} Returns the value of the given attributeName for the
   * fragmentNamespaceData with the given namespaceURI.
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.getFragmentNamespaceAttribute = function(attributeName, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.namespace[uri].attributes[attributeName];
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
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.setFragmentNamespaceAttribute = function(attributeName, attributeValue, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.namespace[uri].attributes[attributeName] = attributeValue;
  };

  /**
   * Adds the given attributeName to the fragment's current namespace
   *
   * Throws an InvalidStateException when the attribute already exists
   *
   * @method addFragmentNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} uri Namespace URI
   */
  // TODO: Possibly remove? Why not just get and set
  ItemMirror.prototype.addFragmentNamespaceAttribute = function(attributeName, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    if (this._fragment.namespace[uri].attributes[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setFragmentNamespaceAttribute(attributeName, uri);
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
   * @param {String} attributeName Name of the attribute.
   * @param {String} uri  Namespace URI
   *
   */
  ItemMirror.prototype.removeFragmentNamespaceAttribute = function(attributeName, uri) {
    delete this._fragment.namespace[uri].attributes[attributeName];
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
   * @param {String} uri URI of the namespace for the association.
   *
   */
  ItemMirror.prototype.hasFragmentNamespace = function (uri) {
    var namespace = this._fragment.namespace[uri];
    if (namespace) { return true; }
    else { return false; }
  };

  /**
   * @method listFragmentNamespaceAttributes
   * @return {String[]} An array of the attributes within the
   * fragmentNamespaceData with the given namespaceURI.
   * @param {String} uri Namespace URI
   *
  */
  ItemMirror.prototype.listFragmentNamespaceAttributes = function(uri) {
    return Object.keys(this._fragment.namespace[uri].attributes);
  };

  /**
   * @method getFragmentNamespaceData
   * @return {String} The fragment namespace data with the given namespace URI.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.getFragmentNamespaceData = function(uri) {
    return this._fragment.namespace[uri].data;
  };

  /**
   * Sets the fragment namespace data with the given namespaceURI.
   *
   * @method setFragmentNamespaceData
   *
   * @param {String} data Fragment namespace data to be set.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.setFragmentNamespaceData = function (data, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};

    this._fragment.namespace[uri].data = data;
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

    // Handle Special cases for the unique stores:
    var self = this,
        isGrouping,
        xooMLOptions,
        itemOptions,
        syncOptions,
        uri;

    var association = self.getAssociationAssociatedItem(GUID);

    // Dropbox root construction
    if (association === 'Dropbox') {
        var dropboxXooMLUtility = {
          fragmentURI: '/XooML2.xml',
          driverURI: 'DropboxXooMLUtility',
          dropboxClient: dropboxClient
        };
        var dropboxItemUtility = {
          driverURI: 'DropboxItemUtility',
          dropboxClient: dropboxClient
        };
        var mirrorSyncUtility = {
          utilityURI: 'MirrorSyncUtility'
        };
        var options = {
          groupingItemURI: '/',
          xooMLDriver: dropboxXooMLUtility,
          itemDriver: dropboxItemUtility,
          syncDriver: mirrorSyncUtility
        };
        return new DropboxItemMirror(options, callback);
    }

    // Google root Construction
    if (association === 'gapi') {
      var driveXooMLUtility = {
        clientInterface: gapi
      };
      var driveItemUtility = {
        clientInterface: gapi
      };
      mirrorSyncUtility = {
        utilityURI: 'MirrorSyncUtility'
      };
      options = {
        groupingItemURI: "root",
        xooMLDriver: driveXooMLUtility,
        itemDriver: driveItemUtility,
        syncDriver: mirrorSyncUtility
      };
      return new ItemMirror(options, callback);
    }

    itemOptions = {
      driverURI: "GoogleItemUtility",
      clientInterface: this._itemDriverClient,
      // Note that this needs to be changed, we want to point to the grouping item's id
      associatedItem: self.getAssociationAssociatedItem(GUID)
    };
    xooMLOptions = {
      fragmentURI: uri,
      driverURI: "GoogleXooMLUtility",
      clientInterface: this._xooMLDriverClient,
      associatedItem: self.getAssociationAssociatedItem(GUID)
    };
    syncOptions = {
      utilityURI: "SyncUtility"
    };

    isGrouping = self.isAssociationAssociatedItemGrouping(GUID);
    if (!isGrouping) {
      // Need to standardize this error
      return callback("Association not grouping, cannot continue");
    }

    new ItemMirror(
      {groupingItemURI: self.getAssociationAssociatedItem(GUID),
       xooMLDriver: xooMLOptions,
       itemDriver: itemOptions,
       syncDriver: syncOptions,
       creator: self
      },
      function (error, itemMirror) {
        return callback(error, itemMirror);
      }
    );
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
   *  @param {String}  options.localItem URI of the new local
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
    var self = this,
        association,
        saveOutFragment;

    saveOutFragment = function(association){
      var guid = association.commonData.ID;
      // adds the association to the fragment
      self._fragment.associations[guid] = association;

      // Save changes out the actual XooML Fragment
      self.save( function(error){
        return callback(error, guid);
      });
    };

    if (!XooMLUtil.isFunction(callback)) {
      throw XooMLExceptions.invalidType;
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }

    // Case 7
    if (options.displayText && options.localItem && options.isGroupingItem) {
      association = new AssociationEditor({
        commonData: {
          displayText: options.displayText,
          isGrouping: true,
          localItem: options.localItem,
          // Changed this part, and need to test folder creation to insure safety
          associatedItem: options.associatedItem
        }
      });

      // Now we use the itemDriver to actually create the folder
      // NOTE: untested
      self._itemDriver.createGroupingItem(options.displayText, function(error){
        if (error) return callback(error);

        return saveOutFragment(association);
      });
    }
    // Synchronous cases
    else {
      // Case 2
      if (options.displayText && options.itemURI) {
        association = new AssociationEditor({
          commonData: {
            displayText: options.displayText,
            associatedItem: options.itemURI,
            isGrouping: false
          }
        });
      }
      // Case 1
      else if (options.displayText) {
        association = new AssociationEditor({
          commonData: {
            displayText: options.displayText,
            isGrouping: false
          }
        });
      }

      return saveOutFragment(association);
    }
  };

  /**
   * @method isAssociationPhantom
   * @param {String} guid
   * @return {Boolean} True if the association of the given GUID is a
   * phantom association. False otherwise.
   */
  ItemMirror.prototype.isAssociationPhantom = function(guid) {
    var data = this._fragment.associations[guid].commonData;
    return !(data.isGrouping || data.localItem);
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
   ItemMirror.prototype.copyAssociation = function () {
    throw new Error('Method not implemented');
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
   ItemMirror.prototype.moveAssociation = function () {
    throw new Error('Method not implemented');
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

    // Save to ensure that the fragment is up to date
    return self.save(deleteContent);

    function deleteContent(error) {
      if (error) return callback(error);

      var isPhantom = self.isAssociationPhantom(GUID);

      if (!isPhantom) {
        var isGrouping = self.isAssociationAssociatedItemGrouping(GUID),
            // For dropbox support, path should be the full path that is
            // dynamically generated. Refer to case 39 for implementation
            // details. UNTESTED
            path = self.getAssociationAssociatedItem(GUID);

        delete self._fragment.associations[GUID];
        if (isGrouping) {
          return self._itemDriver.deleteGroupingItem(path, postDelete);
        } else {
          return self._itemDriver.deleteNonGroupingItem(path, postDelete);
        }
      } else {
        delete self._fragment.associations[GUID];

        // Now do an unsafe_write to commit the XML. It's okay because
        // save means that everything is synced, and this operation
        // was extremely quick
        return self._unsafeWrite(function(error) {
          if (error) return callback(error);
          else return callback();
        });
      }
    }

    // Now do a refresh since actual files were removed.
    function postDelete(error) {
      if (error) return callback(error);

      return self.refresh(function(error) {
        if (error) return callback(error);
        return callback(error);
      });
    }

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
  ItemMirror.prototype.upgradeAssociation = function () {
    throw new Error('Method not implemented');
  };

  /**
   * Renames the local item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not a function. <br/>
   *
   * @method renameAssocaitionLocalItem
   *
   * @param {String} GUID GUID of the association.
   * @param {String} String String Name you want to rename the file to (including file extension)
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @param {String} callback.GUID The GUID of the association that was updated.
   */
  ItemMirror.prototype.renameAssociationLocalItem = function (GUID, newName, callback) {
    // This method needs a redesign, and can't be properly implemented the way
    // it is now. Instead, this needs to pass information to the acual item
    // driver and that needs to implement an agnostic new name format. This
    // path stuff is specific to dropbox and doesn't work
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.save(postSave);

    function postSave(error) {
      if (error) return callback(error);

      // This stuff needs to be replaced with a method that works for all stores
          // oldPath = PathDriver.joinPath(self._groupingItemURI, localItem),
          // newPath = PathDriver.joinPath(self._groupingItemURI, newName);

      self._itemDriver.rename(newName, postMove);
    }

    function postMove(error) {
      if (error) return callback(error);
      // This also needs to be more agnostic
      self._fragment.associations[GUID].commonData.localItem = newName;

      self._unsafeWrite(postWrite);
    }

    function postWrite(error) {
      if (error) return callback(error);

      self.refresh(postRefresh);
    }

    function postRefresh(error) {
      return callback(error, self._fragment.associations[GUID].commonData.ID);
    }
  };

  /**
   * A special method that is used for certain file operations where
   * calling a sync won't work. Essentially it is the save function,
   * sans syncing. This should __never__ be called be an application.
   * @method _unsafeWrite
   * @param callback
   * @param calback.error
   */
  ItemMirror.prototype._unsafeWrite = function(callback) {
    var self = this;

    // Note (12/8/2015) This was never used, but seems like it has purpose. May need to investigate
    //var tmpFragment = new FragmentEditor({text: content});
    self._fragment.updateID();
    return self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
      if (error) return callback(error);
      return callback(false);
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
   * @param {String} uri Namspace URI
   *
   */
  ItemMirror.prototype.getAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.associations[GUID].namespace[uri].attributes[attributeName];
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
   * @param {String} uri Namespace URI
   *
   */
  ItemMirror.prototype.setAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.associations[GUID].namespace[uri].attributes[attributeName] = attributeValue;
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
   * @param {String} attributeValue Value of the attribe to be set
   * @param {String} GUID          GUID of the association.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.addAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    if (this._fragment.associations[GUID].namespace[uri].attributes[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, uri);
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
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.removeAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
    delete this._fragment.associations[GUID].namespace[uri].attributes[attributeName];
  };

  /**
   * @method hasAssociationNamespace
   * @return {Boolean} True if the association has the given
   * namespaceURI, else false.
   *
   * @param {String} GUID          GUID of the association.
   * @param {String} uri  Namespace URI
   *
   */
  ItemMirror.prototype.hasAssociationNamespace = function(GUID, uri) {
    var namespace = this._fragment.associations[GUID].namespace[uri];
    if (namespace) { return true; }
    else { return false; }
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
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.listAssociationNamespaceAttributes = function (GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return Object.keys(this._fragment.associations[GUID].namespace[uri].attributes);
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
   * @param {String} uri Namespace URI
   */
  self.getAssociationNamespaceData = function (GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.associations[GUID].namespace[uri].data;
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
  ItemMirror.prototype.setAssociationNamespaceData = function (data, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.associations[GUID].namespace[uri].data = data;
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
   * Reloads the XooML Fragment
   *
   * @method refresh
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  ItemMirror.prototype.refresh = function(callback) {
    var self = this;

    self._sync( function(error) {
      // This error means that sync changed the fragment
      // We then will reload the fragment based on the new XooML
      if (error === XooMLExceptions.itemMirrorNotCurrent) {
        self._xooMLDriver.getXooMLFragment(resetFragment);
      } else if (error) {
        callback(error);
      } else {
        self._xooMLDriver.getXooMLFragment(resetFragment);
      }
    });

    function resetFragment(error, content){
      if (error) return callback(error);

      self._fragment = new FragmentEditor({text: content});
      return callback(false);
    }
  };

  /**
   * @method getCreator
   *
   * @return {Object} The itemMirror that created this current
   * itemMirror, if it has one. Note that this isn't the same as
   * asking for a 'parent,' since multiple itemMirrors can possibly
   * link to the same one
   *
   */
  ItemMirror.prototype.getCreator = function () {
    return this._creator;
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

    self._sync(postSync);

    function postSync(error) {
      if (error) return callback(error);

      return self._unsafeWrite(postWrite);
    }

    function postWrite(error) {
      return callback(error);
    }
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


// This makes the pacakge accessible as a node module
module.exports = ItemMirror;

// This attaches the library as a global if it doesn't already exist
if (window) { // Checks for window object so we don't break potential node usage
  window.ItemMirror = window.ItemMirror || ItemMirror
}