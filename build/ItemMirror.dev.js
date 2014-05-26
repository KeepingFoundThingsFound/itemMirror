/*
 ItemMirror - Version 0.8.0

 Copyright 2013, William Paul Jones and the Keeping Found Things Found team.

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to copy,
 distribute, run, display, perform, and modify the Software for purposes of
 academic, research, and personal use, subject to the following conditions: The
 above copyright notice and this permission notice shall be included in all copies
 or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
 WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE. For commercial permissions, contact williampauljones@gmail.com
*//**
 * Collection of exceptions associated with the XooML tools.
 *
 * @class XooMLExceptions
 * @static
 */
define('XooMLExceptions.js',[],function() {
  "use strict";

  return {
    /**
     * Thrown when a method is not yet implemented.
     *
     * @event NotImplementedException
     */
    notImplemented: "NotImplementedException",

    /**
     * Thrown when a required property from a method's options is missing.
     *
     * @event MissingParameterException
     */
    missingParameter: "MissingParameterException",

    /**
     * Thrown when an argument is given a null value when it does not accept null
     * values.
     *
     * @event NullArgumentException
     */
    nullArgument: "NullArgumentException",

    /**
     * Thrown when an argument is given a value with a different type from the
     * expected type.
     *
     * @event InvalidTypeException
     */
    invalidType: "InvalidTypeException",

    /**
     * Thrown when an a method is called when the object is in invalid state
     * given what the method expected.
     *
     * @event InvalidStateArgument
     */
    invalidState: "InvalidStateArgument",

    /**
     * Thrown after receiving an exception from XooMLU Storage
     *
     * @event XooMLUException
     */
    xooMLUException: "XooMLUException",

    /**
     * Thrown after receiving an exception from ItemU Storage
     *
     * @event ItemUException
     */
    itemUException: "ItemUException",

    /**
     * Thrown after an association was upgraded that could not be upgraded.
     *
     * @event NonUpgradeableAssociationException
     */
    nonUpgradeableAssociationException: "NonUpgradeableAssociationException",

    /**
     * Thrown after an argument was passed in an invalid state than expected.
     *
     * @event InvalidArgumentException
     */
    invalidArgument: "InvalidOptionsException",

    /**
     * Thrown after expecting a file or folder not to exist when it does.
     *
     * @event FileOrFolderAlreadyExistsException
     */
    itemAlreadyExists: "ItemAlreadyExistsException",

    /**
     * Thrown when expecting the ItemMirror to be current, and it is not.
     *
     * @event FileOrFolderAlreadyExistsException
     */
    itemMirrorNotCurrent: "ItemMirrorNotCurrent"
  };
});

/**
 * Configuration variables for XooML.js
 *
 * @class XooMLConfig
 * @static
 */
define('XooMLConfig.js',[],function() {
  "use strict";

  return {
    // default schema version
    schemaVersion: "0.54",

    // default schema location
    schemaLocation: "http://kftf.ischool.washington.edu/xmlns/xooml",

    // XooMLFragment file name for XooML2.xmlns
    xooMLFragmentFileName: "XooML2.xml",

    // Maximum file length for upgradeAssociation localItemURI truncation
    maxFileLength: 50,

    // Case 1
    createAssociationSimple: {
      "displayText": true
    },

    // Case 2 and 3
    // localItemRequested exists:> case 3
    createAssociationLinkNonGrouping: {
      "displayText": true,        // String
      "itemURI": true,            // String
      "localItemRequested": false // String
    },

    // Case 4 and 5
    // localItemRequested:== true:> Case 5
    createAssociationLinkGrouping: { // Case 3
      "displayText": true,
      "groupingItemURI": true,
      "xooMLDriverURI": true
    },

    // Case 6 and 7
    createAssociationCreate: {
      "displayText": true,
      "itemName": true,
      "isGroupingItem": true
    }
  };
});
/**
 * Collection of type checking, exception throwing, utility methods for the
 * XooML tools.
 *
 * @class XooMLUtil
 * @static
 */
define('XooMLUtil.js',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js"
], function(XooMLExceptions, XooMLConfig) {
  "use strict";

  var
    _GUIDRegex = /\[([a-z0-9]{8}(?:-[a-z0-9]{4}){3}-[a-z0-9]{12})\]/i,
    _TYPES = {
      "[object Boolean]": "boolean",
      "[object Number]": "number",
      "[object String]": "string",
      "[object Function]": "function",
      "[object Array]": "array",
      "[object Date]": "date",
      "[object RegExp]": "regexp",
      "[object Object]": "object",
      "[object Error]": "error"
    };

  var XooMLUtil = {
    /**
     * Checks if each option within the given checkedOptions is a property of
     * the given options.
     *
     * @method hasOptions
     *
     * @param {Object}  checkedOptions Array of strings for each expected option.
     * @param {Object} options         Options given to a function.
     */
    hasOptions: function (checkedOptions, options) {
      if (!checkedOptions || !options) {
        throw XooMLExceptions.nullArgument;
      }
      if (!XooMLUtil.isObject(checkedOptions)
        || !XooMLUtil.isObject(options)) {
        throw XooMLExceptions.invalidType;
      }
      var checkedOption, isRequiredOption, missingOptionalParamCount;

      missingOptionalParamCount = 0;

      if (Object.keys(options).length <= Object.keys(checkedOptions).length) {
        for (checkedOption in checkedOptions) {
          if (checkedOptions.hasOwnProperty(checkedOption)) {
            isRequiredOption = checkedOptions[checkedOption];

            if (!options.hasOwnProperty(checkedOption)) {
              if (isRequiredOption) {
                return false;
              } else {
                missingOptionalParamCount += 1;
              }
            }
          }
        }
      } else {
        return false;
      }

      return Object.keys(options).length <=
        Object.keys(checkedOptions).length - missingOptionalParamCount;
    },

    // throws exceptions for callbacks since null callbacks mean the program can't continue
    checkCallback: function (callback) {
      if (callback) {
        if (!XooMLUtil.isFunction(callback)) {
          throw XooMLExceptions.invalidType;
        }
      } else {
        throw XooMLExceptions.nullArgument;
      }
    },

    isGUID: function (GUID) {
      if (XooMLUtil.getType(GUID) === "string") {
        return true; // TODO implement guid checking
      } else {
        return false;
      }
    },

    /**
     * Returns if the given value is an array.
     *
     * Throws NullArgumentException when value is null. <br/>
     *
     * @method isArray
     *
     * @param {Object} value Given object have it's type checked.
     */
    isArray: function (value) {
      return XooMLUtil.getType(value) === "array";
    },

    /**
     * Returns if the given value is an object.
     *
     * Throws NullArgumentException when value is null. <br/>
     *
     * @method isObject
     *
     * @param {Object} value Given object have it's type checked.
     *
     * @return {Boolean} True if the given value is an Object, else false.
     */
    isObject: function (value) {
      return XooMLUtil.getType(value) === "object";
    },

    /**
     * Returns if the given value is an function.
     *
     * Throws NullArgumentException when value is null. <br/>
     *
     * @method isFunction
     *
     * @param {Object} value Given object have it's type checked.
     *
     * @return {Boolean} True if the given value is a Function, else false.
     */
    isFunction: function (value) {
      return value !== null;
      //return XooMLUtil.getType(value) === "function"; TODO figure out why this doesn't work
    },

    /**
     * Returns if the given value is an string.
     *
     * Throws NullArgumentException when value is null. <br/>
     *
     * @method isString
     *
     * @param {Object} value Given object have it's type checked.
     *
     * @return {Boolean} True if the given value is a String, else false.
     */
    isString: function (value) {
      return XooMLUtil.getType(value) === "string";
    },

    isBoolean: function (value) {
      return XooMLUtil.getType(value) === "boolean";
    },

    /**
     * Generates a GUID.
     *
     * @method generateGUID
     *
     * @return {String} Randomly generated GUID.
     */
    generateGUID: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    getType: function (obj) {
      if (obj == null) {
        return String(obj);
      }
      return typeof obj === "object" ||
        typeof obj === "function" ? _TYPES[obj.toString()]
        || "object" : typeof obj;
    },

    endsWith: function (string, suffix) {
      return string.indexOf(suffix, string.length - suffix.length) !== -1;
    },

    // http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
    clone: function (obj) {
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = XooMLUtil.clone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = XooMLUtil.clone(obj[attr]);
        }
        return copy;
      }

      throw XooMLExceptions.invalidType;
    }
  };

  return XooMLUtil;
});

define('PathDriver.js',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js"
], function (
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var
    _PATH_SEPARATOR = "/",
    self;

  function PathDriver() {}
  self = PathDriver.prototype;

  self.joinPath = function (rootPath, leafPath) {
    var self = this;

    if (rootPath === _PATH_SEPARATOR) {
      return leafPath
    }

    rootPath = self._stripTrailingSlash(rootPath);
    leafPath = self._stripLeadingSlash(leafPath);

    return rootPath + _PATH_SEPARATOR + leafPath;
  };

  self.joinPathArray = function (rootPath, leafPath) {
    throw XooMLExceptions.notImplemented;
  };

  self.splitPath = function (path) {
    return path.split(_PATH_SEPARATOR);
  };

  self.formatPath = function (path) {
    return self._stripTrailingSlash(path);
  };

  self.isRoot = function (path) {
    return path === _PATH_SEPARATOR;
  };

  self.getPathSeparator = function () {
    return _PATH_SEPARATOR;
  };

  self._stripTrailingSlash = function (path) {
    var strippedPath;

    if (path === _PATH_SEPARATOR) {
      return path;
    }

    strippedPath = path;
    if (XooMLUtil.endsWith(strippedPath, _PATH_SEPARATOR)) {
      strippedPath = strippedPath.substring(0, strippedPath.length - 1);
    }

    return strippedPath;
  };

  self._stripLeadingSlash = function (path) {
    var strippedPath;

    if (path === _PATH_SEPARATOR) {
      return path;
    }

    strippedPath = path;
    if (path.indexOf(_PATH_SEPARATOR) === 0) {
      strippedPath = strippedPath.substring(1);
    }

    return strippedPath;
  };

  return new PathDriver();
});
/**
 * XooMLAssociation is a minimal interface to represent a XooML2 association
 * within a fragment.
 *
 * Throws NullArgumentException when GUID, name, or isUpgradeable is null. <br/>
 * Throws InvalidTypeException if GUID, or name is not a String and if
 * isUpgradeable is not a boolean. <br/>
 * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
 *
 * @class XooMLAssociation
 * @constructor
 *
 * @param {String}  GUID           GUID of the association.
 * @param {Boolean} isUpgradeable  Boolean representing if the association
 *                  is upgradeable.
 * @param {String}  displayText    Display text of the association.
 * @param {String}  associatedItem Associated item of the association.
 */
define('XooMLAssociation.js',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var self;

  function XooMLAssociation(isGroupingItem, displayText) {
    if (!XooMLUtil.isBoolean(isGroupingItem)
      || !XooMLUtil.isString(displayText)) {
      throw XooMLExceptions.invalidType;
    }

    this._isGroupingItem = isGroupingItem;
    this._displayText = displayText;
  }
  self = XooMLAssociation.prototype;

 /**
  * Returns a boolean representing if this XooMLAssociation is a grouping item.
  *
  * @method getIsGroupingItem
  *
  * @return {Boolean} True if this XooMLAssociation is a grouping item
  *                   else returns false.
  */
  self.getIsGroupingItem = function() {
    return this._isGroupingItem;
  };

 /**
  * Returns the display text of this association.
  *
  * @method getDisplayText
  *
  * @return {String} The display text of this association.
  */
  self.getDisplayText = function() {
    return this._displayText;
  };

  return XooMLAssociation;
});

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
 * @class FragmentDriver
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
define('FragmentDriver.js',[
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

/**
 * An item utility interacts with the item storage and is responsible for
 * creating and deleting items. This is an implementation of item utility
 * using Dropbox as the item storage.
 *
 * @class ItemDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new ItemU with
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 */
define('ItemDriver.js',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js",
  "./XooMLAssociation.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  XooMLAssociation) {
  "use strict";

  var
  // private static variables
    _CONSTRUCTOR__OPTIONS = {
      driverURI: true,
      dropboxClient: true
    },
    _DIRECTORY_STAT = "inode/directory",

  //oop helper
    self;

  /**
   * Constructs a ItemDriver for reading/writing Item Storage
   */
  function ItemDriver(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.isFunction(callback)) {
      return callback(XooMLExceptions.invalidType);
    }
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR__OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    var self = this;

    // private variables
    self._dropboxClient = options.dropboxClient;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error) {
        if (error) {
          return callback(XooMLExceptions.itemUException, null);
        }
        return callback(false, self);
      });
    }
  }
  self = ItemDriver.prototype;

  // callback(false) on success
  self.moveGroupingItem = function (fromPath, newPath, callback) {
    var self = this;

    self._dropboxClient.move(fromPath, newPath, function (error, stat) {
      if (error) {
        return callback(error);
      }

      return callback(false);
    });
  };

  self.isGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.stat(path, function (error,stat){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat.mimeType === _DIRECTORY_STAT);
    });
  };

  /**
   * Creates a grouping item at the location
   * @method createGroupingItem
   * @param {String} path the path to the location that the grouping item will be created
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.createGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.mkdir(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };

  /**
   * Creates or uploads a non-grouping item at the location
   * @method createNonGroupingItem
   * @param {String} path the path to the location that the non-grouping item will be created
   * @param {String} file the contents to be written to the non-grouping item
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.createNonGroupingItem = function (path, file, callback) {
    var self = this;

    self._dropboxClient.writeFile(path, file, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };

  /**
   * Deletes a grouping item at the location
   * @method deleteGroupingItem
   * @param {String} path the path to the location that the grouping item is located
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.deleteGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.remove(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };

  /**
   * Deletes a non-grouping item at the location
   * @method deleteNonGroupingItem
   * @param {String} path the path to the location that the non-grouping item is located
   * @param {String} name the name of the non-grouping item
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.deleteNonGroupingItem = function (path, callback) {
    var self = this;

    self._dropboxClient.remove(path, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });
  };
  
    /**
   * Copies an item in the fashion of moveItem
   * @method copyItem
   * @param {String} fromPath the path to the file you want copied
   * @param {String} toPath the GroupingItem path you want the fromPath file copied to
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.copyItem = function (fromPath, toPath, callback) {
    var self = this;
    
    self._dropboxClient.copy(fromPath, toPath, function(error){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false);
    });
  };
  
  /**
   * Moves an item
   * @method moveItem
   * @param {String} fromPath the path to the file you want moved
   * @param {String} toPath the GroupingItem path you want the fromPath file moved
   * @param {Function} callback Function to be called when self function is finished with it's operation.
   */
  self.moveItem = function (fromPath, toPath, callback) {
    var self = this;
    
    self._dropboxClient.move(fromPath, toPath, function(error){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false);
    });
  };

  /**
   * Get publicly readable download url for a non-grouping item from Dropbox website.
   * @method getURL
   * @param {String} path the path to the location that the non-grouping item is located
   * @param {Function} callback Function to be called when self function is finished with it's operation.
  */
  self.getURL = function (path, callback){
    var self = this;
    
    self._dropboxClient.makeUrl(path, null, function (error, publicURL){
        if (error) {
          return self._showDropboxError(error, callback);
        }
         return callback(false, publicURL.url);
    });
  };

  /**
   * Lists the items under the grouping item
   * @method listItems
   * @param {String} path the path to the grouping item
   * @param {Function} callback(output) Function to be called when self function is finished with it's operation. Output is an array of XooMLAssociations.
   */
  self.listItems = function (path, callback) {
    var self = this;

    self._dropboxClient.readdir(path, function (error, list, stat, listStat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      var i, output;

      output = [];

      for (i = 0; i < listStat.length; i += 1) {
        if (listStat[i].name !== XooMLConfig.xooMLFragmentFileName) {
          output.push(new XooMLAssociation(
            listStat[i].mimeType === _DIRECTORY_STAT,
            listStat[i].name
          ));
        }
      }
      return callback(false, output);
    });
  };

  /**
   * Check if the item is existed
   * @method checkExisted
   * @param {String} path the path to the location that the item is located
   * @param {String} name the name of the item
   * @param {Function} callback(result) Function to be called when self function is finished with it's operation. Result is the bollean value for whether existed.
   */
  self.checkExisted = function(path, callback){
    var self = this, result;

    self._dropboxClient.stat(path, function (error,stat){
      if (error) {
        return self._showDropboxError(error, callback);
      }
      result = !(error !== null && error.status === 404) || (error === null && stat.isRemoved);

      return callback(false, result);
    });
  };

  self._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  self._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return ItemDriver;
});
/**
 * An XooML utility interacts with an storage and is responsible for
 * reading and writing XooML fragments. This is an implementation of XooML utility
 * using Dropbox as the storage.
 *
 * @class XooMLDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new XooMLU with
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 */
define('XooMLDriver.js',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var
    _CONSTRUCTOR_OPTIONS = {
      driverURI:   true,
      dropboxClient: true
    },
    self;

  /**
   * Constructs a XooMLDriver for reading/writing XooML fragment.
   */
  function XooMLDriver(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }
    var self = this;

    self._dropboxClient = options.dropboxClient;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      return callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error, client) {
        if (error) {
          return callback(XooMLExceptions.xooMLUException, null)
        }
        return callback(false, self);
      });
    }
  }
  self = XooMLDriver.prototype;

  /**
   * Reads and returns a XooML fragment
   * @method getXooMLFragment
   * @param {String} uri the location of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   */
  self.getXooMLFragment = function (uri, callback) {
    var self = this;

    self._dropboxClient.readFile(uri, function (error, content) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      callback(false, content);
    });
  };

  /**
   * Writes a XooML fragment
   * @method setXooMLFragment
   * @param {String} uri the location of the XooML fragment
   * @param {String} fragment the content of the XooML fragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   */
  self.setXooMLFragment = function (uri, fragment, callback) {
    var self = this;

    self._dropboxClient.writeFile(uri, fragment, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      callback(false, stat);
    });

  };

  /**
   * Check if the XooML fragment is existed
   * @method checkExisted
   * @param {String} uri the location of the XooML fragment
   * @param {Function} callback(result) Function to be called when self function is finished with it's operation. Result is the bollean value for whether existed.
   */
  self.checkExisted = function (uri, callback) {
    var self = this, result;

    self._dropboxClient.stat(uri, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      if ((error !== null && error.status === 404) || (error === null && stat.isRemoved === true)) {
        result = false;
      } else {
        result = true;
      }

      callback(false, result);
    });
  };

  self._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  self._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return XooMLDriver;
});

define('SyncDriver.js',[
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

    self._itemMirror = itemMirror
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
  }

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
/**
 * ItemMirror represents an Item according to the XooML2 specification.
 *
 * It can be instantiated using one of the following two cases based on the
 * given arguments.
 *
 * Case 1: XooMLFragment already exists. Given xooMLFragmentURI and xooMLDriver.
 * <br/>
 * Case 2: The XooMLFragment is created from an existing groupingItemURI.
 * Given a groupingItemURI, saveLocationURI. Optionally a itemDriver,
 * syncDriver, and a xooMLDriver can be supplied for the XooMLFragment.
 * <br/>
 * Case 3: Try case 1, and then fallback on case 2.
 *
 * Throws NullArgumentException when options is null. <br/>
 * Throws MissingParameterException when options is not null and a required
 * argument is missing.<br/>
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
define('ItemMirror',[
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js",
  "./PathDriver.js",
  "./FragmentDriver.js",
  "./ItemDriver.js",
  "./XooMLDriver.js",
  "./SyncDriver.js"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  FragmentDriver,
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
    if (!XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_2_AND_3_OPTIONS, options)
      && !XooMLUtil.hasOptions(_CONSTRUCTOR_CASE_1_OPTIONS, options)) {
      return callback(XooMLExceptions.missingParameter);
    }
    var self = this, xooMLFragmentURI;

    // private variables
    self._xooMLDriver = null;
    self._itemDriver = null;
    self._syncDriver = null;
    self._fragmentDriver = null;
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
   * Returns the grouping item URI.
   *
   * @method getGroupingItemURI
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.groupingItemURI Grouping item URI.
   */
  self.getGroupingItemURI = function (callback) {
    var self = this;

    return callback(false, self._groupingItemURI);
  };

  /**
   * Returns the display name.
   *
   * @method getDisplayName
   *
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

  /*
   * Returns the XooML schema version.
   *
   * @method getSchemaVersion
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.schemaVersion XooML schema version.
   */
  self.getSchemaVersion = function (callback) {
    var self = this;

    self._fragmentDriver.getSchemaVersion(callback);
  };

  /*
   * Returns the XooML schema location.
   *
   * @method getSchemaLocation
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.schemaVersion XooML schema location.
   */
  self.getSchemaLocation = function (callback) {
    var self = this;

    self._fragmentDriver.getSchemaLocation(callback);
  };

  /**
   * Returns URI pointing to item described by the metadata of a fragment. A URI
   * might point to just about anything that can be interpreted as a grouping
   * item. For example: a conventional file system folder or a “tag�as
   * supported by any of several applications.
   *
   * @method getItemDescribed
   * @async
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.itemDescribed A URI pointing to item
   *                    described by the metadata of a fragment if it
   *                    exists, else returns null.
   */
  self.getItemDescribed = function (callback) {
    var self = this;

    self._fragmentDriver.getItemDescribed(callback);
  };

  /*
   * Returns the item driver. An item driver supports HTML5 filesystem API. self
   * driver must work hand in glove with SyncU. There is no exclusive control
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
   *  @param {String}   callback.itemDriver A URI of the item driver.
   */
  self.getItemDriver = function (callback) {
    var self = this;

    self._fragmentDriver.getItemDriver(callback);
  };

  /*
   * Returns the sync driver URI.
   *
   * @method getSyncDriver
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.syncDriver A URI of the sync driver.
   */
  self.getSyncDriver = function (callback) {
    var self = this;

    self._fragmentDriver.getSyncDriver(callback);
  };

  /**
   * Returns a publicly available URL hosted at dropbox for an associated non-grouping item
   * @method getURLForAssociatedNonGroupingItem
   *
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
  
  /*
   * Returns the XooML driver.
   *
   * @method getXooMLDriver
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.xooMLDriver A URI of the XooML driver.
   */
  self.getXooMLDriver = function (callback) {
    var self = this;

    self._fragmentDriver.getXooMLDriver(callback);
  };

  /**
   * Returns the GUID generated on the last modification to the file.
   *
   * @method getGUIDGeneratedOnLastWrite
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.GUIDGeneratedOnLastWrite Gets the GUID
   *                    generated on last write of this XooML Fragment.
   */
  self.getGUIDGeneratedOnLastWrite = function (callback) {
    var self = this;

    self._fragmentDriver.getGUIDGeneratedOnLastWrite(callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.displayText The display text.
   */
  self.getAssociationDisplayText = function (GUID, callback) {
    var self = this;

    self._fragmentDriver.getAssociationDisplayText(GUID, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setAssociationDisplayText = function (GUID, displayText, callback) {
    var self = this;

    self._fragmentDriver.setAssociationDisplayText(GUID, displayText, function (error) {
      self._handleSet(error, callback);
    });
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.associatedXooMLFragment The associated
   *                    XooMLFragment.
   */
  self.getAssociationAssociatedXooMLFragment = function (GUID, callback) {
    var self = this;

    self._fragmentDriver.getAssociationAssociatedXooMLFragment(GUID, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.localItem Local item of the association
   *                    with the given GUID.
   */
  self.getAssociationLocalItem = function (GUID, callback) {
    var self = this;

    self._fragmentDriver.getAssociationLocalItem(GUID, callback);
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

    self._fragmentDriver.getAssociationAssociatedItem(GUID, callback)
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.fragmentNamespaceAttribute Value of the given
   *                    attributeName within the given namespaceURI if the given
   *                    attributeName exists, else returns null.
   */
  self.getFragmentNamespaceAttribute = function (attributeName, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.getFragmentNamespaceAttribute(attributeName, namespaceURI, callback);
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

    self._fragmentDriver.addFragmentNamespaceAttribute(attributeName, namespaceURI, callback);
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

    self._fragmentDriver.removeFragmentNamespaceAttribute(attributeName, namespaceURI, callback);
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

    self._fragmentDriver.hasFragmentNamespace(namespaceURI, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setFragmentNamespaceAttribute = function (attributeName, attributeValue, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.setFragmentNamespaceAttribute(attributeName,
      attributeValue, namespaceURI, function (error) {
        self._handleSet(error, callback);
    });
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String[]} callback.fragmentNamespaceAttributes Array of
   *                    attributes within the fragmentNamespaceData with
   *                    the given namespaceURI.
   */
  self.listFragmentNamespaceAttributes = function (namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.listFragmentNamespaceAttributes(namespaceURI, callback);
  };

  /**
   * Returns the fragment namespace data with the given namespaceURI.
   *
   * Throws NullArgumentException if namespaceURI is null. <br/>
   * Throws InvalidTypeException if namespaceURI is not a String. <br/>
   *
   * @method getFragmentNamespaceData
   *
   * @param {String} namespaceURI URI of the namespace to be set.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.fragmentNamespaceData Fragment namespace
   *                    data with the given namespaceURI. If a string is
   *                    returned it will be valid fragmentNamespaceData.
   */
  self.getFragmentNamespaceData = function (namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.getFragmentNamespaceData(namespaceURI, callback);
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
   * @param {String} namespaceURI URI of the namespace to be set.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setFragmentNamespaceData = function (data, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.setFragmentNamespaceData(data, namespaceURI, function (error) {
      self._handleSet(error, callback);
    });
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
   *
   * @param {String} GUID GUID of the association to create the ItemMirror
   *                 from.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {ItemMirror} callback.itemMirror ItemMirror from the groupingItem
   *                      of the given GUID, null if the given GUID is not
   *                      a grouping item.
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

      self._fragmentDriver.getAssociationAssociatedItem(GUID, function (error, associatedItem) {
        if (error) {
          return callback(error);
        }
        var associatedXooMLFragment;

        associatedXooMLFragment = PathDriver.joinPath(associatedItem, XooMLConfig.xooMLFragmentFileName);

        self._fragmentDriver.setAssociationAssociatedXooMLFragment(GUID, associatedXooMLFragment, function (error) {
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
   * Case 1: Simple text association declared phantom. <br/>
   * Case 2: Link to existing non-grouping item, phantom. <br/>
   * Case 3: Link to existing non-grouping item, real. <br/>
   * Case 4: Link to existing grouping item, phantom. <br/>
   * Case 5: Link to existing grouping item, real. <br/>
   * Case 6: Create new local non-grouping item. <br/>
   * Case 7: Create new local grouping item. <br/>
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
   *  @param {String}  options.itemURI URI of the item. Required for case 2 & 3.
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

    self._fragmentDriver.createAssociation(options, function (error, GUID) {
      if (error) {
        return callback(error);
      }

      if (isSimple) {
        self._createAssociationSimple(GUID, options, callback)
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
   * @param {String} GUID GUID of the source item you wish to copy/duplicate
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
   self.moveAssociation = function (GUID, ItemMirror, callback) {
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
            self._fragmentDriver.deleteAssociation(GUID, function (error) {
              if(error) {
                return callback(error);
              }
              return self._save(callback);
            });
          });
          return self._save(callback);
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

    self.getAssociationLocalItem(GUID, function (error, localItem) {
      if (error) {
        return callback(error);
      }

      self._fragmentDriver.deleteAssociation(GUID, function (error) {
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
      self._getSubGroupingItemURIFromDisplayText(options.GUID, options.localItemURI, callback);
    } else {
      self.getAssociationDisplayText(options.GUID, function (error, displayText) {
        if (error) {
          return callback(error);
        }
        self._getSubGroupingItemURIFromDisplayText(options.GUID, displayText, callback);
      });
    }
  };

  /**
   * Renames the local item for the association with the given GUID.
   *
   * NOT IMPLEMENTED
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
   * Checks if the association with the given GUID is a grouping item.
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not an function. <br/>
   *
   * @method isAssociatedItemGrouping
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
  self.isAssociatedItemGrouping = function (GUID, callback) {
    var self = this;

    self._fragmentDriver.getAssociationAssociatedItem(GUID,
      function (error, associatedItem) {
      if (error) {
        return callback(error);
      }
      if (!associatedItem || associatedItem === "") {
        return callback(false, false);
      }
      var path;

      path = PathDriver.joinPath(self._groupingItemURI, associatedItem);

      self._itemDriver.isGroupingItem(path, function (error, result) {
        if (error) {
          return callback(error);
        }

        return callback(false, result);
      });
    });
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
    var self = this;

    self._fragmentDriver.listAssociations(callback);
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
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.associationNamespaceAttribute Value of
   *                    association namespace attribute with the given
   *                    attributeName and the given namespaceURI within the
   *                    association with the given GUID.
   */
  self.getAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.getAssociationNamespaceAttribute(attributeName, GUID, namespaceURI, callback);
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
  self.addAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.addAssociationNamespaceAttribute(attributeName, GUID, namespaceURI, callback);
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
  self.removeAssociationNamespaceAttribute = function (attributeName, GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.removeAssociationNamespaceAttribute(attributeName, GUID, namespaceURI, callback);
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

    self._fragmentDriver.hasAssociationNamespace(GUID, namespaceURI, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setAssociationNamespaceAttribute = function (attributeName, attributeValue, GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, namespaceURI, function (error) {
      self._handleSet(error, callback);
    });
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
   * @param {String} GUID          GUID of association to list attributes for.
   * @param {String} namespaceURI  URI of the namespace for the association.
   *
   * @return
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String[]} Array of the attributes within the association namespace
   *                    with the given namespaceURI.
   */
  self.listAssociationNamespaceAttributes = function (GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.listAssociationNamespaceAttributes(GUID, namespaceURI, callback);
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
   * @param {String} namespaceURI  URI of the namespace of the association
   *                               namespace data to returned.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.associationNamespaceData Association
   *                    namespace data if the association namespace data
   *                    exists, else returns null. If a string is returned
   *                    it will be valid fragmentNamespaceData.
   */
  self.getAssociationNamespaceData = function (GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.getAssociationNamespaceData(GUID, namespaceURI, callback);
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  self.setAssociationNamespaceData = function (data, GUID, namespaceURI, callback) {
    var self = this;

    self._fragmentDriver.setAssociationNamespaceData(data, GUID, namespaceURI, function (error) {
      self._handleSet(error, callback);
    });
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

    self.getGUIDGeneratedOnLastWrite(function(error,GUID){
      if (error) {
        return callback(error);
      }
      inMemoryGUID = GUID;
      xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);
      self._xooMLDriver.getXooMLFragment(xooMLFragmentURI, function (error,content) {
        if (error) {
            return callback(error);
          }
        new FragmentDriver({ xooMLFragmentString: content }, function (error, tempDataWrapper) {
        tempDataWrapper.getGUIDGeneratedOnLastWrite(function (error, GUID) {
          if (error) {
            return callback(error);
          }
          fileGUID = GUID;
          callback(false, inMemoryGUID === fileGUID);
        });
      });
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
   * Returns a string representation of self.
   *
   * @method toString
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.toString String representation of self
   *                    wrapper.
   */
  self.toString = function (callback) {
    var self = this;

    self._fragmentDriver.toString(callback);
  };

  /**
   * Returns the parent ItemMirror if this ItemMirror has a parent.
   *
   * @method getParent
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.parent Parent ItemMirror of this
   *                    ItemMirror object if it has a parent, else
   *                    null.
   */
  self.getParent = function (callback) {
    var self = this;

    return callback(false, self._parent);
  };

  self._getSubGroupingItemURIFromDisplayText = function (GUID, displayText, callback) {
    var self = this, length, subGroupingItemURI, path;

    length = displayText.length <= XooMLConfig.maxFileLength
      ? displayText.length
      : XooMLConfig.maxFileLength;
    subGroupingItemURI = displayText.substring(0, length);
    path = PathDriver.joinPath(self._groupingItemURI, subGroupingItemURI);

    self._itemDriver.createGroupingItem(path, function (error) {
      if (error) {
        return callback(error);
      }
      self._setAssociationLocalItemAndAssociatedItem(GUID, subGroupingItemURI, callback);
    });
  };

  self._setAssociationLocalItemAndAssociatedItem = function (GUID, itemURI, callback) {
    var self = this;

    self._fragmentDriver.setAssociationLocalItem(GUID, itemURI, function (error) {
      if (error) {
        return callback(error);
      }
      self._fragmentDriver.setAssociationAssociatedItem(GUID, itemURI, function (error) {
        if (error) {
          return callback(error);
        }
        self._save(callback);
      })
    });
  };

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

  self._saveFragment = function (callback) {
    var self = this;

    self._fragmentDriver.updateETag(function (error, GUID) {
      if (error) {
        return callback(error);
      }

      self._fragmentDriver.toString(function (error, toString) {
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

  self._createSyncDriver = function () {
    var self = this;

    return new SyncDriver(self);
  };

  /**
   * Async Methods for loading the XooML Fragment String
   *
   * @method loadXooMLFragmentString
   * @private
   */
  self._loadXooMLFragmentString = function (uri, callback) {
    var self = this;

    self._xooMLDriver.getXooMLFragment(uri, function (error, content) {
      if (error) {
        return callback(error, null);
      }

      new FragmentDriver({
        xooMLFragmentString: content
      }, function (error, fragmentWrapper) {
        if (error) {
          return callback(error);
        }

        self._fragmentDriver = fragmentWrapper;
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
   * Async Methods for getting list of items
   *
   * @method getItemList
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

  self._createXooMLFragment = function (options, list, callback) {
    var self = this, fragmentWrapperOptions;

    fragmentWrapperOptions = {
      associations:    list,
      xooMLUtilityURI: options.xooMLDriver.driverURI,
      itemUtilityURI:  options.itemDriver.driverURI,
      syncUtilityURI:  options.syncDriver.driverURI,
      groupingItemURI: options.groupingItemURI
    };

    new FragmentDriver(fragmentWrapperOptions, function (error, fragmentWrapper) {
      if (error) {
        return callback(error, null);
      }

      self._fragmentDriver = fragmentWrapper;
      self._syncDriver = self._createSyncDriver();
      self._saveFragment(callback);
    });
  };

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

  self._removeNonGroupingItemThroughAssociation = function (GUID, item, callback) {
    var self = this, path;

    path = PathDriver.joinPath(self._groupingItemURI, item);

    self._itemDriver.deleteNonGroupingItem(path, function (error) {
      self._handleSet(error, callback);
    });
  };

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

  self._createAssociationSimple = function (GUID, options, callback) {
    var self = this;

    // Case 1
    return self._save(function (error) {
      return callback(error, GUID);
    });
  };

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

    if (!options.isGroupingItem) {
      return self._createAssociationNonGroupingItem(GUID, options, callback); // Case 6
    } else {
      return self._createAssociationGroupingItem(GUID, options, callback); // Case 7
    }
  };

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

  self._saveAssociationAssociatedXooMLFragment = function (GUID, options, callback) {
    var self = this;

    self._fragmentDriver.setAssociationAssociatedXooMLFragment(GUID,
      XooMLConfig.xooMLFragmentFileName, function (error) {
      if (error) {
        return callback(error);
      }

      self._save(function (error) {
        callback(error, GUID);
      });
    });
  };

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


  return ItemMirror;
});

