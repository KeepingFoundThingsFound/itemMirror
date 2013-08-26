/**
 * Constructs a FragmentWrapper for a XooML fragment. In the following cases.
 *
 * Case 1: xooMLFragmentString is given and is used as the XooMLFragment. <br/>
 * Case 2: associations, xooMLUtilityURI, itemUtilityURI, syncUtilityURI,
 * groupingItemURI are given and used to create a new XooMLFragment with
 * the given data.
 *
 * Throws NullArgumentException when options is null. <br/>
 * Throws MissingParameterException when options is not null and does not have
 * the necessary arguments for any given case. <br/>
 *
 * @class FragmentWrapper
 * @constructor
 * @async
 *
 * @param {Object} options Data to construct a new FragmentWrapper with
 *   @param {String} options.xooMLFragmentString XML string representing a XooML2
 *                   fragment. Required for case 1.
 *   @param {XooMLAssociation[]} options.associations List of associations for
 *          the newly constructed XooMLFragment in case 2. Required in Case 2.
 *   @param {String} options.xooMLUtilityURI URI for the XooMLUtility for the
 *          newly constructed XooMLFragment in case 2. Required in Case 2.
 *   @param {String} options.itemUtilityURI URI for the ItemUtility for the
 *          newly constructed XooMLFragment in case 2. Required in Case 2.
 *   @param {String} options.syncUtilityURI URI for the SyncUtility for the
 *          newly constructed XooMLFragment in case 2. Required in Case 2.
 *   @param {String} options.groupingItemURI URI for the Grouping Item for the
 *          newly constructed XooMLFragment in case 2. Required in Case 2.
 * @param {Function}[callback] callback function
 *  @param {String} callback.error The error to the callback
 *
 **/
define([
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js",
  "./PathDriver.js",
  "./XooMLAssociation.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  XooMLAssociation) {
  "use strict";

  var
    _NAMESPACE_ATTRIBUTE = "xmlns",
    _FRAGMENT = "fragment",
    _FRAGMENT_NAMESPACE_DATA = "fragmentNamespaceData",
    _FRAGMENT_SCHEMA_VERSION = "schemaVersion",
    _FRAGMENT_SCHEMA_LOCATION = "schemaLocation",
    _FRAGMENT_ITEM_DESCRIBED = "itemDescribed",
    _ITEM_DESCRIBED = ".",
    _FRAGMENT_ITEM_DRIVER = "itemDriver",
    _FRAGMENT_SYNC_DRIVER = "syncDriver",
    _FRAGMENT_XOOML_UTILITY = "xooMLDriver",
    _FRAGMENT_GUID = "GUIDGeneratedOnLastWrite",
    _ASSOCIATION = "association",
    _ASSOCIATION_NAMESPACE_DATA = "associationNamespaceData",
    _ASSOCIATION_GUID = "ID",
    _ASSOCIATION_DISPLAY_TEXT = "displayText",
    _ASSOCIATION_ASSOCIATED_XOOML_FRAGMENT = "associatedXooMLFragment",
    _ASSOCIATION_ASSOCIATED_XOOML_DRIVER = "associatedXooMLDriver",
    _ASSOCIATION_ASSOCIATED_ITEM = "associatedItem",
    _ASSOCIATION_LOCAL_ITEM = "localItem",
    _XML_XSI_URI = "http://www.w3.org/2001/XMLSchema-instance",

    _DEFAULT_VALUE_FOR_ADD_ATTRIBUTE = "",

    _CONSTRUCTOR_CASE_1_OPTIONS = {
      "xooMLFragmentString": true
    },
    _CONSTRUCTOR_CASE_2_OPTIONS = {
      "associations": true,
      "xooMLUtilityURI": true,
      "itemUtilityURI": true,
      "syncUtilityURI": true,
      "groupingItemURI": true
    },

    self;

  function FragmentDriver(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this;

    if (XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_1_OPTIONS, options)) {
      self._document = self._parseXML(options.xooMLFragmentString);
      return callback(false, self);
    } else if (XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_2_OPTIONS, options)) {
      self._document = self._createXooMLFragment(options.associations,
        options.xooMLUtilityURI, options.itemUtilityURI,
        options.syncUtilityURI, options.groupingItemURI);
      return callback(false, self);
    } else {
      return callback(XooMLExceptions.missingParameter);
    }
  }
  self = FragmentDriver.prototype;

  /**
   * Updates the ETag.
   *
   * @method updateETag
   * @private updateETag
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.GUID GUID from the new ETag.
   */
  self.updateETag = function (callback) {
    var self = this, GUID;

    GUID = XooMLUtil.generateGUID();
    self._document.getElementsByTagName(_FRAGMENT)[0].getAttribute(_FRAGMENT_GUID);

    return callback(false, GUID);
  };

  /**
   * Returns the XooML schema version.
   *
   * @method getSchemaVersion
   *
   * @return {String} XooML schema version.
   */
  self.getSchemaVersion = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_SCHEMA_VERSION, _FRAGMENT, null, null,
      callback);
  };

  /**
   * Sets the XooML schema version.
   *
   * Throws NullArgumentException if schemaVersion is null. <br/>
   * Throws InvalidTypeException if schemaVersion is not a String. <br/>
   *
   * @method setSchemaVersion
   *
   * @param {String} schemaVersion Schema version to be set.
   */
  self.setSchemaVersion = function (schemaVersion, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_SCHEMA_VERSION, schemaVersion, _FRAGMENT,
      null, null, callback);
  };

  /**
   * Returns the XooML schema location.
   *
   * @method getSchemaLocation
   *
   * @return {String} XooML schema location.
   */
  self.getSchemaLocation = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_SCHEMA_LOCATION, _FRAGMENT, null,
      null, callback);
  };

  /**
   * Sets the XooML schema location.
   *
   * Throws NullArgumentException if schemaLocation is null. <br/>
   * Throws InvalidTypeException if schemaLocation is not a String. <br/>
   *
   * @method setSchemaLocation
   *
   * @param {String} schemaLocation Schema location to be set.
   */
  self.setSchemaLocation = function (schemaLocation, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_SCHEMA_LOCATION, schemaLocation,
      _FRAGMENT, null, null, callback);
  };

  /**
   * Returns URI pointing to item described by the metadata of a fragment. A URI
   * might point to just about anything that can be interpreted as a grouping
   * item. For example: a conventional file system folder or a “tag's
   * supported by any of several applications.
   *
   * @method getItemDescribed
   *
   * @return {String} A URI pointing to item described by the metadata of a
   *                  fragment if it exists, else returns null.
   */
  self.getItemDescribed = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_ITEM_DESCRIBED, _FRAGMENT, null, null,
      callback);
  };

  /**
   * Sets the item described by self fragment.
   *
   * Throws NullArgumentException if itemDescribed is null. <br/>
   * Throws InvalidTypeException if itemDescribed is not a String. <br/>
   *
   *
   * @method setItemDescribed
   * @async
   * @param {String} itemDescribed Item described to be set.
   * @param {Function}[callback] callback function
   * @param {String} callback.error The error to the callback
   **/
  self.setItemDescribed = function (itemDescribed, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_ITEM_DESCRIBED, itemDescribed, _FRAGMENT,
      null, null, callback);
  };

  /**
   * Returns the item utility. An item utility supports HTML5 filesystem API. self
   * utility must work hand in glove with SyncU. There is no exclusive control
   * over items as stored in the dataStore so need to view and synchronize.
   * Invoked directly to Open and Close. Delete, create. Invoked indirectly via
   * UI.
   *
   * @method getItemDriver
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.itemUtility A URI of the item utility.
   */
  self.getItemDriver = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_ITEM_DRIVER, _FRAGMENT, null, null,
      callback);
  };

  /**
   * Sets the item utility. An item utility supports HTML5 filesystem API. self
   * utility must work hand in glove with SyncU. There is no exclusive control
   * over items as stored in the dataStore so need to view and synchronize.
   * Invoked directly to Open and Close. Delete, create. Invoked indirectly via
   * UI.
   *
   * Throws NullArgumentException if itemUtility is null. <br/>
   * Throws InvalidTypeException if itemUtility is not a String. <br/>
   *
   * @method setItemUtility
   *
   * @param {String} itemUtility Item utility to be set.
   */
  self.setItemUtility = function (itemUtility, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_ITEM_DRIVER, itemUtility, _FRAGMENT,
      null, null, callback);
  };

  /**
   * Returns the sync utility.
   *
   * @method getSyncUtility
   *
   * @return {String} Sync utility.
   */
  self.getSyncDriver = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_SYNC_DRIVER, _FRAGMENT, null, null,
      callback);
  };

  /**
   * Sets the sync utility.
   *
   * Throws NullArgumentException if syncUtility is null. <br/>
   * Throws InvalidTypeException if syncUtility is not a String. <br/>
   *
   * @method setSyncUtility
   *
   * @param {String} syncUtility Item utility to be set.
   */
  self.setSyncUtility = function (syncUtility, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_SYNC_DRIVER, syncUtility, _FRAGMENT,
      null, null, callback);
  };

  /**
   * Returns the XooML utility.
   *
   * @method getXooMLUtility
   *
   * @return {String} XooML utility.
   */
  self.getXooMLDriver = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_XOOML_UTILITY, _FRAGMENT, null, null,
      callback);
  };

  /**
   * Sets the XooML utility.
   *
   * Throws NullArgumentException if xooMlUtility is null. <br/>
   * Throws InvalidTypeException if xooMlUtility is not a String. <br/>
   *
   * @method setXooMLUtility
   *
   * @param {String} xooMlUtility Item utility to be set.
   */
  self.setXooMLUtility = function (xooMlUtility, callback) {
    var self = this;

    self._setAttribute(_FRAGMENT_XOOML_UTILITY, xooMlUtility, _FRAGMENT,
      null, null, callback);
  };

  /**
   * Returns the GUID generated on the last modification to the file.
   *
   * @method getGUIDGeneratedOnLastWrite
   *
   * @return {String} GUID Guid
   */
  self.getGUIDGeneratedOnLastWrite = function (callback) {
    var self = this;

    self._getAttribute(_FRAGMENT_GUID, _FRAGMENT, null, null, callback);
  };

  /**
   * Returns an array of the attributes within the fragment common.
   *
   * @method listFragmentCommonAttributes
   *
   * @return {String[]} Array of attributes within the the fragment common.
   */
  self.listFragmentCommonAttributes = function (callback) {
    var self = this;

    self._listAttributes(_FRAGMENT, null, null, callback);
  };

  /**
   * Returns the display text for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationDisplayText
   *
   * @param {String} GUID GUID of the association to get.
   *
   * @return {String} Display name of the association with the given GUID.
   */
  self.getAssociationDisplayText = function (GUID, callback) {
    var self = this;

    self._getAttribute(_ASSOCIATION_DISPLAY_TEXT, _ASSOCIATION, null, GUID, callback);
  };

  /**
   * Sets the display name for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or displayName is null. <br/>
   * Throws InvalidTypeException if GUID or displayName is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationDisplayName
   *
   * @param {String} GUID        GUID of the association to set.
   * @param {String} displayName Display name to be set.
   */
  self.setAssociationDisplayText = function (GUID, displayName, callback) {
    var self = this;

    self._setAttribute(_ASSOCIATION_DISPLAY_TEXT, displayName,
      _ASSOCIATION_GUID, null, GUID, callback);
  };

  /**
   * Returns the XooML fragment for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationAssociatedXooMLFragment
   *
   * @param {String} GUID GUID of the association to get.
   *
   * @return {String} XooML fragment of the association with the given GUID.
   */
  self.getAssociationAssociatedXooMLFragment = function (GUID, callback) {
    var self = this;

    self._getAttribute(_ASSOCIATION_ASSOCIATED_XOOML_FRAGMENT,
      _ASSOCIATION, null, GUID, callback);
  };

  /**
   * Sets the XooML fragment for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or xooMLFragment is null. <br/>
   * Throws InvalidTypeException if GUID or xooMLFragment is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationAssociatedXooMLFragment
   *
   * @param {String} GUID                    GUID of the association to set.
   * @param {String} associatedXooMLFragment Fragment XooML fragment to be set.
   */
  self.setAssociationAssociatedXooMLFragment = function (GUID,
    associatedXooMLFragment, callback) {
    var self = this;

    self._setAttribute(_ASSOCIATION_ASSOCIATED_XOOML_FRAGMENT,
      associatedXooMLFragment, _ASSOCIATION_GUID, null, GUID, callback);
  };

  /**
   * Returns the XooML utility for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationXooMLUtility
   *
   * @param {String} GUID GUID of the association to get.
   *
   * @return {String} XooML utility of the association with the given GUID.
   */
  self.getAssociationXooMLUtility = function (GUID, callback) {
    var self = this;

    self._getAttribute(_ASSOCIATION_ASSOCIATED_XOOML_DRIVER,
      _ASSOCIATION, null, GUID, callback);
  };

  /**
   * Sets the XooML utility for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or xooMLUtility is null. <br/>
   * Throws InvalidTypeException if GUID or xooMLUtility is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationXooMLUtility
   *
   * @param {String} GUID         GUID of the association to set.
   * @param {String} xooMLUtility XooML utility to be set.
   */
  self.setAssociationXooMLUtility = function (GUID, xooMLUtility, callback) {
    var self = this;

    self._setAttribute(_ASSOCIATION_ASSOCIATED_XOOML_DRIVER,
      xooMLUtility, _ASSOCIATION_GUID, null, GUID, callback);
  };

  /**
   * Returns the local item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationLocalItem
   *
   * @param {String} GUID GUID of the association to get.
   *
   * @return {String} Local item of the association with the given GUID.
   */
  self.getAssociationLocalItem = function (GUID, callback) {
    var self = this;

    self._getAttribute(_ASSOCIATION_LOCAL_ITEM, _ASSOCIATION, null,
      GUID, callback);
  };

  /**
   * Sets the local item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or localItem is null. <br/>
   * Throws InvalidTypeException if GUID or localItem is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationLocalItem
   *
   * @param {String} GUID      GUID of the association to set.
   * @param {String} localItem Local item to be set.
   */
  self.setAssociationLocalItem = function (GUID, localItem, callback) {
    var self = this;

    return self._setAttribute(_ASSOCIATION_LOCAL_ITEM, localItem,
      _ASSOCIATION_GUID, null, GUID, callback);
  };

  /**
   * Returns the associated item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationAssociatedItem
   *
   * @param {String} GUID GUID of the association to get.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.associatedItem Associated item of the
   *                    association with the given GUID.
   */
  self.getAssociationAssociatedItem = function (GUID, callback) {
    var self = this;

    self._getAttribute(_ASSOCIATION_ASSOCIATED_ITEM, _ASSOCIATION, null,
      GUID, callback);
  };

  /**
   * Sets the associated item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationAssociatedItem
   *
   * @param {String} GUID GUID of the association to get.
   * @param {String} associatedItem Associated item to set.
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setAssociationAssociatedItem = function (GUID, associatedItem, callback) {
    var self = this;

    return self._setAttribute(_ASSOCIATION_ASSOCIATED_ITEM, associatedItem,
      _ASSOCIATION_GUID, null, GUID, callback);
  };

  /**
   * Returns an array of the association common attributes within the
   * association with the given GUID.
   *
   * Throws NullArgumentException if GUID or localItem is null. <br/>
   * Throws InvalidTypeException if GUID or localItem is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method listAssociationCommonAttributes
   *
   * @param {String} GUID GUID of the association to list common attributes for.
   *
   * @return {String[]} Association common attributes within the association
   */
  self.listAssociationCommonAttributes = function (GUID, callback) {
    var self = this;

    self._listAttributes(_ASSOCIATION, null, GUID, callback);
  };

  /**
   * Returns the value of the given attributeName for the fragmentNamespaceData
   * with the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName or namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName or namespaceURI is not a
   * String. <br/>
   *
   * @method getFragmentNamespaceAttribute
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} namespaceURI Name of the namespace of the given
   *                               attributeName.
   *
   * @return {String} Value of the given attributeName within the given
   *                  namespaceURI if the given attributeName exists, else
   *                  returns null.
   */
  self.getFragmentNamespaceAttribute = function (attributeName, namespaceURI, callback) {
    var self = this;

    self._getAttribute(attributeName, _FRAGMENT_NAMESPACE_DATA,
      namespaceURI, null, callback);
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
  self.addFragmentNamespaceAttribute = function (attributeName, namespaceURI, callback) {
    var self = this;

    return self._addAttribute(attributeName, _FRAGMENT_NAMESPACE_DATA,
      namespaceURI, null, callback);
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
  self.removeFragmentNamespaceAttribute = function (attributeName, namespaceURI, callback) {
    var self = this;

    return self._removeAttribute(attributeName, _FRAGMENT_NAMESPACE_DATA,
      namespaceURI, null, callback);
  };

  /**
   * Checks if the fragment has the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, or namespaceURI is not
   * a String. <br/>
   *
   * @method Namespace
   *
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {Object}   callback.result True if the fragment has the
   *                    given namespaceURI, else false.
   */
  self.hasFragmentNamespace = function (namespaceURI, callback) {
    var self = this;

    self._hasNamespace(null, namespaceURI, callback);
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
   * @param {String} namespaceURI   Name of the namespace of the given
   *                                attributeName.
   */
  self.setFragmentNamespaceAttribute = function (attributeName, attributeValue, namespaceURI, callback) {
    var self = this;

    return self._setAttribute(attributeName, attributeValue,
      _FRAGMENT_NAMESPACE_DATA, namespaceURI, null, callback);
  };

  /**
   * Returns an array of the attributes within the fragmentNamespaceData with the
   * given namespaceURI.
   *
   * Throws NullArgumentException if namespaceURI is null. <br/>
   * Throws InvalidTypeException if namespaceURI is not a String. <br/>
   *
   * @method listFragmentNamespaceAttributes
   * @param {String} namespaceURI  Name of the namespace of the given
   *                                attributeName.
   *
   * @return {String[]} Array of attributes within the fragmentNamespaceData with
   *                 the given namespaceURI.
   */
  self.listFragmentNamespaceAttributes = function (namespaceURI, callback) {
    var self = this;

    self._listAttributes(_FRAGMENT_NAMESPACE_DATA, namespaceURI, null, callback);
  };

  /**
   * Returns the fragment namespace data with the given namespaceURI.
   *
   * Throws NullArgumentException if namespaceURI is null. <br/>
   * Throws InvalidTypeException if namespaceURI is not a String. <br/>
   *
   * @method getFragmentNamespaceData
   *
   * @param {String} namespaceURI Name of the namespace to be set.
   *
   * @return {String} Fragment namespace data with the given namespaceURI.
   *                  If a string is returned it will be valid
   *                  fragmentNamespaceData.
   */
  self.getFragmentNamespaceData = function (namespaceURI, callback) {
    var self = this;

    self._getNamespaceData(_FRAGMENT, namespaceURI, null, callback);
  };

  /**
   * Returns the fragment namespace data with the given namespaceURI.
   *
   * Throws NullArgumentException if namespaceURI or data is null. <br/>
   * Throws InvalidTypeException if namespaceURI or data is not a String. <br/>
   *
   * @method setFragmentNamespaceData
   *
   * @param {String} data Fragment namespace data to be set. Must be valid
   *                 namespaceData.
   * @param {String} namespaceURI Name of the namespace to be set.
   */
  self.setFragmentNamespaceData = function (data, namespaceURI, callback) {
    var self = this;

    self._setNamespaceData(_FRAGMENT, namespaceURI, null, data, callback);
  };

  /**
   * Creates an association based on the given options and the following
   * cases.
   *
   * Case 1: Simple text association declared phantom. <br/>
   * Case 2: Link to existing non-grouping item, phantom. <br/>
   * Case 3: Link to existing non-grouping item, real. <br/>
   * Case 4: Link to existing grouping item, phantom. <br/>
   * Case 5: Link to existing grouping item, real. <br/>
   * Case 6: Create new local non-grouping item. <br/>
   * Case 7: Create new local grouping item. <br/>
   *
   * Throws NullArgumentException when options, callback is null. <br/>
   * Throws InvalidTypeException when options is not an object and callback
   * is not a function. <br/>
   * Throws MissingParameterException when an argument is missing for an expected
   * case. <br/>
   *
   * @method createAssociation
   *
   * @param {Object} options Data to create an new association for.
   *
   *  @param {String}  options.displayText. Display text for the association.
   *                   Required in all cases.
   *
   *  @param {String}  options.itemOrXooMLFragmentURI URI of the item or
   *                   XooMLFragment depending on the case. Required for
   *                   cases 2, 3, 4 & 5.
   *
   *  @param {Boolean} options.localItemRequested True if the local item is
   *                   requested, else false. Required for cases 2, 3, 4, & 5.
   *
   *  @param {String}  options.xooMLUtilityURI URI of the XooML utility for the
   *                   association. Required for cases 4 & 5.
   *
   *  @param {String}  options.itemName Name of the new local
   *                   non-grouping/grouping item. Required for cases 6 & 7.
   *
   *  @param {String}  options.itemType Type of the new local
   *                   non-grouping/grouping item. Required for case 6.
   *
   * @return {String} GUID of the newly created association.
   */
  self.createAssociation = function (options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this, GUID, isLinkNonGrouping, isSimple, isLinkGrouping, isCreate;

    self._updateFragment(self._document);
    GUID = XooMLUtil.generateGUID();
    isSimple = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationSimple, options);
    isLinkNonGrouping = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationLinkNonGrouping, options);
    isLinkGrouping = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationLinkGrouping, options);
    isCreate = XooMLUtil.hasOptions(XooMLConfig.
      createAssociationCreate, options);

    if (isSimple) {
      return self._createAssociation(GUID, null, options.displayText, null, null, null, callback);
    } else if (isLinkNonGrouping) {
      return self._createAssociationLinkNonGrouping(GUID, options, callback);
    } else if (isLinkGrouping) {
      return self._createAssociationLinkGrouping(GUID, options, callback);
    } else if (isCreate) {
      return self._createAssociationCreate(GUID, options, callback);
    } else {
      return callback(XooMLExceptions.missingParameter);
    }
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
   */
  self.deleteAssociation = function (GUID, callback) {
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this, association, associations, i;

    associations =  self._document.getElementsByTagName(_ASSOCIATION);
    for (i = 0; i < associations.length; i += 1) {
      association = associations[i];
      if (association.getAttribute(_ASSOCIATION_GUID) === GUID) {
        association.parentNode.removeChild(association);
        return callback(false);
      }
    }

    //"Association with given GUID does not exist."
    return callback(XooMLExceptions.invalidArgument);
  };

  /**
   * Lists the GUIDs of each association.
   *
   * @method listAssociations
   *
   * @return {String[]} Array of the GUIDs of each association
   *                    of the given namespaceURI
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String[]} callback.GUIDs Array of each association GUID
   *                    within given namespaceURI.
   */
  self.listAssociations = function (callback) {
    XooMLUtil.checkCallback(callback);
    var self = this, associations, associationNodes, associationNode, i, GUID;

    associations = [];
    associationNodes = self._document.getElementsByTagName(_ASSOCIATION);
    for (i = 0; i < associationNodes.length; i += 1) {
      associationNode = associationNodes[i];
      GUID = associationNode.getAttribute(_ASSOCIATION_GUID);
      associations.push(GUID);
    }
    return callback(false, associations);
  };

  /**
   * Returns the association namespace attribute with the given attributeName
   * and the given namespaceURI within the association with the given GUID.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} GUID          GUID of the association to return attribute from.
   * @param {String} namespaceURI Name of the namespace for the association.
   *
   * @return {String} Value of association namespace attribute with the given
   *                  attributeName and the given namespaceURI within the
   *                  association with the given GUID.
   */
  self.getAssociationNamespaceAttribute = function (attributeName, GUID,
    namespaceURI, callback) {
    var self = this;

    self._getAttribute(attributeName, _ASSOCIATION_NAMESPACE_DATA,
      namespaceURI, GUID, callback);
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
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.addAssociationNamespaceAttribute = function (attributeName, GUID,
    namespaceURI, callback) {
    var self = this;

    self._addAttribute(attributeName, _ASSOCIATION_NAMESPACE_DATA, namespaceURI,
      GUID, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.removeAssociationNamespaceAttribute = function (attributeName, GUID,
    namespaceURI, callback) {
    var self = this;

    return self._removeAttribute(attributeName, _ASSOCIATION_NAMESPACE_DATA,
      namespaceURI, GUID, callback);
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
   * @param {String} namespaceURI   Name of the namespace for the association.
   */
  self.setAssociationNamespaceAttribute = function (attributeName,
    attributeValue, GUID, namespaceURI, callback) {
    var self = this;

    return self._setAttribute(attributeName, attributeValue,
      _ASSOCIATION_NAMESPACE_DATA, namespaceURI, GUID, callback);
  };

  /**
   * Returns if an association with the given GUID has the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method hasAssociationNamespace
   *
   * @param {String} GUID          GUID of the association.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {Object}   callback.result True if the association has the
   *                    given namespaceURI, else false.
   */
  self.hasAssociationNamespace = function (GUID, namespaceURI, callback) {
    var self = this;

    self._hasNamespace(GUID, namespaceURI, callback);
  };

  /**
   * Returns an array of the association namespace attributes with the given
   * attributeName and the given namespaceURI within the association with
   * the given GUID.
   *
   * Throws NullArgumentException if GUID, namespaceURI is null. <br/>
   * Throws InvalidTypeException if GUID, namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method listAssociationNamespaceAttributes
   *
   * @param {String} GUID         GUID of association to list attributes for.
   * @param {String} namespaceURI Name of the namespace for the association.
   *
   * @return {String[]} Array of the attributes within the association namespace
   *                    with the given namespaceURI.
   */
  self.listAssociationNamespaceAttributes = function (GUID, namespaceURI, callback) {
    var self = this;

    self._listAttributes(_ASSOCIATION_NAMESPACE_DATA, namespaceURI, GUID, callback);
  };

  /**
   * Returns the association namespace data for an association with the given GUID
   * and the given namespaceURI.
   *
   * Throws NullArgumentException if GUID, namespaceURI is null. <br/>
   * Throws InvalidTypeException if GUID, namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceData
   *
   * @param {String} GUID          GUID of the association namespace data to
   *                               returned.
   * @param {String} namespaceURI  Name of the namespace of the association
   *                               namespace data to returned.
   *
   * @return {String} Association namespace data if the association namespace data
   *                  exists, else returns null. If a string is returned it will be
   *                  valid fragmentNamespaceData.
   */
  self.getAssociationNamespaceData = function (GUID, namespaceURI, callback) {
    var self = this;

    self._getNamespaceData(_ASSOCIATION_NAMESPACE_DATA, namespaceURI, GUID, callback);
  };

  /**
   * Sets the association namespace data for an association with the given GUID
   * and given namespaceURI using the given data.
   *
   * Throws NullArgumentException if data, GUID, or namespaceURI is null. <br/>
   *  Throws InvalidTypeException if data, GUID, or namespaceURI is not a
   * String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationNamespaceData
   *
   * @param {String} data          Association namespace data to set. Must be
   *                               valid fragmentNamespaceData.
   * @param {String} GUID          GUID of the association namespace data to set.
   * @param {String} namespaceURI  Name of the namespace of the association
   *                               namespace data to set.
   */
  self.setAssociationNamespaceData = function (data, GUID, namespaceURI, callback) {
    var self = this;

    self._setNamespaceData(_ASSOCIATION_NAMESPACE_DATA, namespaceURI, GUID, data, callback);
  };

  /**
   * Returns a string representation of wrapper.
   *
   * @method toString
   *
   * @return {String} String representation of self wrapper.
   */
  self.toString = function (callback) {
    XooMLUtil.checkCallback(callback);
    var self = this, tmp;

    tmp = document.createElement("div");
    tmp.appendChild(self._document.firstChild.cloneNode(true));

    callback(false, tmp.innerHTML);
  };

  /**
   * TODO
   *
   * @method _parseXML
   * @private _parseXML
   *
   * @param {String} xml TODO
   *
   * @return {Object} TODO
   */
  self._parseXML = function (xml) {
    var parser, xmlDoc;

    if (window.DOMParser) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xml, "text/xml");
    } else {// Internet Explorer
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(xml);
    }

    return xmlDoc;
  };

  /**
   * TODO
   *
   * @method _createXooMLFragment
   * @private _createXooMLFragment
   *
   * @return {Object} TODO GUID of the
   */
  self._createXooMLFragment = function (associations,
    xooMLUtilityURI, itemUtilityURI, syncUtilityURI) {
    var self = this, fragment, document, i, association, GUID, associatedXooMLFragment;

    document = self._parseXML("<" + _FRAGMENT + "></" + _FRAGMENT + ">");
    fragment = document.firstChild;
    fragment.setAttribute("xmlns", XooMLConfig.schemaLocation);
    fragment.setAttribute("xmlns:xsi", _XML_XSI_URI);
    fragment.setAttribute(_FRAGMENT_ITEM_DRIVER, itemUtilityURI);
    fragment.setAttribute(_FRAGMENT_XOOML_UTILITY, xooMLUtilityURI);
    fragment.setAttribute(_FRAGMENT_SYNC_DRIVER, syncUtilityURI);
    fragment.setAttribute(_FRAGMENT_ITEM_DESCRIBED, _ITEM_DESCRIBED);
    fragment.setAttribute(_FRAGMENT_SCHEMA_LOCATION, XooMLConfig.schemaLocation);
    fragment.setAttribute(_FRAGMENT_SCHEMA_VERSION, XooMLConfig.schemaVersion);
    fragment.setAttribute(_FRAGMENT_GUID, XooMLUtil.generateGUID());

    for (i = 0; i < associations.length; i += 1) {
      association = associations[i];
      GUID = XooMLUtil.generateGUID();

      associatedXooMLFragment = association.getIsGroupingItem()
        ? PathDriver.joinPath(association.getDisplayText(),
        XooMLConfig.xooMLFragmentFileName)
        : null;
      self._createAssociation(GUID,
        associatedXooMLFragment,
        association.getDisplayText(),
        association.getDisplayText(),
        association.getDisplayText(),
        fragment
      );
    }

    return document;
  };


  /**
   * Creates an association.
   *
   * @method self._createAssociation
   * @private
   *
   * @param {String} GUID GUID of the association
   * @param {String} associationXooMLFragment  TODO
   * @param {String} displayText    Display text of the association.
   * @param {String} associatedItem Associated item of the association.
   * @param {String} localItem TODO
   * @param {Object} fragment TODO
   */
  self._createAssociation = function (GUID, associationXooMLFragment, displayText, associatedItem, localItem, fragment, callback) {
    var self = this, association, parent;

    parent = fragment || self._document.firstChild;
    localItem = localItem || "";
    associatedItem = associatedItem || "";
    associationXooMLFragment = associationXooMLFragment || "";

    association = self._parseXML("<" + _ASSOCIATION + "/>").firstChild;
    //associationXooMLFragment = isUpgradeable ? XooMLConfig.upgradeableString : "";
    association.setAttribute(_ASSOCIATION_GUID, GUID);
    association.setAttribute(_ASSOCIATION_ASSOCIATED_ITEM, associatedItem);
    association.setAttribute(_ASSOCIATION_DISPLAY_TEXT, displayText);
    association.setAttribute(_ASSOCIATION_LOCAL_ITEM, localItem);
    association.setAttribute(_ASSOCIATION_ASSOCIATED_XOOML_FRAGMENT, associationXooMLFragment);
    association.setAttribute(_ASSOCIATION_ASSOCIATED_XOOML_DRIVER, ""); // TODO consider removal?
    parent.appendChild(association.cloneNode(true));

    if (callback) {
      return callback(false, GUID);
    }
  };

  self._createAssociationLinkNonGrouping = function (GUID, options, callback) {
    var self = this;

    if (!options.localItemRequested) { // Case 2
      return self._createAssociation(GUID, null, options.displayText, options.itemURI, null,  null, callback);
    } else { // Case 3
      return callback(XooMLExceptions.notImplemented);
    }
  };

  self._createAssociationLinkGrouping = function (GUID, options, callback) {
    return callback(XooMLExceptions.notImplemented);
    var self = this;

    if (!options.localItemRequested) {
      // Case 4
    } else {
      // Case 5
    }
  };

  self._createAssociationCreate = function (GUID, options, callback) {
    var self = this;

    if (!options.isGroupingItem) { // Case 6
      self._createAssociation(GUID, null, options.displayText, options.itemName, options.itemName, null, callback);
    } else { // Case 7
      self._createAssociation(GUID, null, options.displayText, options.itemName, options.itemName, null, callback);
    }
  };

  // for now does now update etag, because that is done at the ItemMirror level,
  // it will simply return the old GUID. it should eventually be removed
  self._updateFragment = function (fragment) {
    var self = this;

    return fragment.getElementsByTagName(_FRAGMENT)[0].getAttribute(_FRAGMENT_GUID);
  };

  /**
   * TODO meta function for self._setAttribute, self._listAttributes, self._getAttribute, self._setNamespaceData, self._getNamespaceData
   *
   * Throws NullArgumentException if elementName is null. <br/>
   * Throws InvalidTypeException if GUID, or namespaceURI exists and is not a
   * string. <br/>
   *
   * @method _getOrCreateElement
   * @private _getOrCreateElement
   *
   * @param {String} elementName  Name of the element
   * @param {String} namespaceURI TODO
   * @param {String} GUID TODO
   *
   * @return {Object} TODO
   */
  self._getOrCreateElement = function (elementName, namespaceURI, GUID, callback) {
    if (!elementName) {
      return callback(XooMLExceptions.nullArgument);
    }
    if ((GUID && !XooMLUtil.isGUID(GUID))
      || (namespaceURI && !XooMLUtil.isString(namespaceURI))
      || !XooMLUtil.isString(elementName)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this;

    return GUID !== null ? self._getAssociation(self._document, GUID, namespaceURI, true) :
      self._getFragment(self._document, namespaceURI, true);
  };

  self._getFragment = function (documentNode, namespaceURI, createIfNotExist) {
    var self = this, fragmentNamespaceDataNodes, fragmentNamespaceDataNode, i;
    if (!namespaceURI) {
      return documentNode.firstChild;
    }

    createIfNotExist = createIfNotExist || true;

    fragmentNamespaceDataNodes = documentNode.
      getElementsByTagName(_FRAGMENT_NAMESPACE_DATA);

    for (i = 0; i < fragmentNamespaceDataNodes.length; i += 1) {
      fragmentNamespaceDataNode = fragmentNamespaceDataNodes[i];
      if (namespaceURI === fragmentNamespaceDataNode.
        getAttribute(_NAMESPACE_ATTRIBUTE)) {
        return fragmentNamespaceDataNode;
      }
    }

    if (createIfNotExist) {
      fragmentNamespaceDataNode = documentNode
        .createElement(_FRAGMENT_NAMESPACE_DATA);
      fragmentNamespaceDataNode.setAttribute(_NAMESPACE_ATTRIBUTE, namespaceURI);
      documentNode.getElementsByTagName(_FRAGMENT)[0]
        .appendChild(fragmentNamespaceDataNode);
      return fragmentNamespaceDataNode;
    } else {
      return null;
    }
  };

  self._getAssociation = function (documentNode, GUID, namespaceURI, createIfNotExist) {
    var self = this, childNodes, childNode, namespaceNodes, namespaceNode, i, j;

    createIfNotExist = createIfNotExist || true;

    childNodes = documentNode.getElementsByTagName(_ASSOCIATION);
    for (i = 0; i < childNodes.length; i += 1) {
      childNode = childNodes[i];
      if (childNode.getAttribute(_ASSOCIATION_GUID) === GUID) {
        if (!namespaceURI) {
          return childNode
        }

        // figure out bug with getElementsByTagName, work this logic by finding the association first
        namespaceNodes = documentNode.getElementsByTagName(_ASSOCIATION_NAMESPACE_DATA);
        for (j = 0; j < namespaceNodes.length; j += 1) {
          namespaceNode = namespaceNodes[j];
          if (namespaceNode.getAttribute(_NAMESPACE_ATTRIBUTE) === namespaceURI
            && namespaceNode.parentNode.getAttribute(_ASSOCIATION_GUID) == GUID) {
            return namespaceNode;
          }
        }

        return createIfNotExist
          ? self._createNewNamespaceData(documentNode, childNode, _ASSOCIATION_NAMESPACE_DATA, namespaceURI)
          : null
      }
    }

    return createIfNotExist
      ? self._createNewAssociation(documentNode, GUID, namespaceURI)
      : null
  };

  self._createNewNamespaceData = function (documentNode, commonNode, namespaceElementName, namespaceURI) {
    var self = this, namespaceDataNode;

    namespaceDataNode = documentNode.createElement(namespaceElementName);
    namespaceDataNode.setAttribute(_NAMESPACE_ATTRIBUTE, namespaceURI);
    commonNode.appendChild(namespaceDataNode);

    return namespaceDataNode;
  };

  self._createNewAssociation = function (documentNode, GUID, namespaceURI) {
    var self = this, association, associationNamespaceData;

    association = documentNode.createElement(_ASSOCIATION);
    association.setAttribute(_ASSOCIATION_GUID, GUID);
    if (namespaceURI) {
      associationNamespaceData = self._createNewNamespaceData(documentNode, association, _ASSOCIATION_NAMESPACE_DATA, namespaceURI);
    }
    documentNode.getElementsByTagName(_FRAGMENT)[0].appendChild(association);

    return namespaceURI
      ? associationNamespaceData
      : association;
  };

  /**
   * Returns the value of the given attributeName for the common fragment.
   *
   * @method _getAttribute
   * @private _getAttribute
   *
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} elementName TODO
   * @param {String} namespaceURI TODO
   * @param {String} GUID TODO
   *
   * @return {String} Value of the given attributeName if the attributeName
   *                  exists, else null.
   */
  self._getAttribute = function (attributeName, elementName, namespaceURI, GUID, callback) {
    var self = this;

    self._retrieveAttribute(attributeName,  elementName, namespaceURI, GUID, function (error, element) {
      if (error) {
        throw error;
      }

      return callback(false, element.getAttribute(attributeName));
    });
  };

  /**
   * Sets the given attributeName to the given attributeValue for the fragment
   *  common.
   *
   * @method _setAttribute
   * @private _setAttribute
   * @param {String} attributeName  Name of the attribute to be set.
   * @param {String} attributeValue Value of the attribute to be set. If type
   *                                of attributeValue is an Array than multiple
   *                                values, each element of the array, will be
   *                                set to the given attributeName. Else if
   *                                the type of attributeValue is a String than
   *                                one value, the given string, will be set to
   *                                the given attributeName
   * @param {String} elementName    TODO
   * @param {String} namespaceURI   TODO
   * @param {String} GUID           TODO
   */
  self._setAttribute = function (attributeName, attributeValue, elementName, namespaceURI, GUID, callback) {
    var self = this;

    self._retrieveAttribute(attributeName, elementName, namespaceURI, GUID, function (error, element) {
      if (error) {
        throw error;
      }
      // TODO: Consider checking for the variables existence.

      element.setAttribute(attributeName, attributeValue);
      self._updateFragment(self._document);
      callback(false);
    });
  };

  self._addAttribute = function (attributeName, elementName, namespaceURI, GUID, callback) {
    var self = this;

    self._retrieveAttribute(attributeName, elementName, namespaceURI, GUID, function (error, element) {
      if (error) {
        throw error;
      }
      if (element.getAttribute(attributeName)) {
        return callback(XooMLExceptions.invalidState);
      }

      element.setAttribute(attributeName, _DEFAULT_VALUE_FOR_ADD_ATTRIBUTE);
      self._updateFragment(self._document);
      callback(false);
    });
  };

  self._removeAttribute = function (attributeName, elementName, namespaceURI, GUID, callback) {
    var self = this;

    self._retrieveAttribute(attributeName, elementName, namespaceURI, GUID, function (error, element) {
      if (error) {
        return callback(error);
      }
      if (!element.getAttribute(attributeName)) {
        return callback(XooMLExceptions.invalidState);
      }

      element.removeAttribute(attributeName);
      self._updateFragment(self._document);
      callback(false);
    });
  };


  self._retrieveAttribute = function (attributeName, elementName, namespaceURI, GUID, callback) {
    XooMLUtil.checkCallback(callback);
    if (!attributeName) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isString(attributeName)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this, element;

    element = self._getOrCreateElement(elementName, namespaceURI, GUID, callback);
    return callback(false, element);
  };

  self._listAttributes = function (elementName, namespaceURI, GUID, callback) {
    XooMLUtil.checkCallback(callback);
    var self = this, element, attributes, i, attrib;

    element = self._getOrCreateElement(elementName, namespaceURI, GUID, callback);
    attributes = [];
    for (i = 0; i < element.attributes.length; i += 1) {
      attrib = element.attributes[i];
      attributes.push(attrib.name);
    }

    return callback(false, attributes);
  };

  self._getNamespaceData = function (elementName, namespaceURI, GUID, callback) {
    var self = this, element;

    element = self._getOrCreateElement(elementName, namespaceURI, GUID, callback);
    return callback(false, element.innerHTML);
  };

  self._setNamespaceData = function (elementName, namespaceURI, GUID, data, callback) {
    XooMLUtil.checkCallback(callback);
    if (!data) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isString(data)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this, element;

    element = self._getOrCreateElement(elementName, namespaceURI, GUID, callback);
    element.innerHTML = data;
    callback(false);
  };

  self._hasNamespace = function (GUID, namespaceURI, callback) {
    XooMLUtil.checkCallback(callback);
    if (!namespaceURI) {
      return callback(XooMLExceptions.nullArgument);
    }
    if ((GUID && !XooMLUtil.isGUID(GUID))) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this, element, query;

    element = GUID
      ? self._getAssociation(self._document, GUID, namespaceURI, false)
      : self._getFragment(self._document, namespaceURI, false);

    return callback(false, element !== null)
  };

  return FragmentDriver;
});