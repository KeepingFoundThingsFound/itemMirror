/**
 * Collection of type checking, exception throwing, utility methods for the
 * XooML tools.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLUtil
 * @static
 *
 * @protected
 */
define([
  "./XooMLExceptions",
  "./XooMLConfig"
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
     *
     * @protected
     */
    hasOptions: function (checkedOptions, options) {
      if (!checkedOptions || !options) {
        throw XooMLExceptions.nullArgument;
      }
      if (!XooMLUtil.isObject(checkedOptions) ||
          !XooMLUtil.isObject(options)) {
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
     *
     * @protected
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
     *
     * @protected
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
     *
     * @protected
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
     *
     * @protected
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
     *
     * @protected
     */
    generateGUID: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    getType: function (obj) {
      if (obj === null) {
        return String(obj);
      }
      return typeof obj === "object" ||
        typeof obj === "function" ? _TYPES[obj.toString()] || "object" : typeof obj;
    },

    endsWith: function (string, suffix) {
      return string.indexOf(suffix, string.length - suffix.length) !== -1;
    },

    // http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
    clone: function (obj) {
      var copy;
      // Handle the 3 simple types, and null or undefined
      if (null === obj || "object" != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = XooMLUtil.clone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
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
