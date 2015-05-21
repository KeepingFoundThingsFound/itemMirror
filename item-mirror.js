/*
 itemMirror - Version 2.0

 Copyright 2015, Keeping Found Things Found, LLC.
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to copy,
 distribute, run, display, perform, and modify the Software for purposes of
 academic, research, and personal use, subject to the following conditions:
1. The  above copyright notice and this permission notice shall be included in all copies
 or substantial portions of the Software.
2. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by Keeping Found Things Found.
3. Neither the name of the Keeping Found Things Found nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Keeping Found Things Found , LLC, ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

. For commercial permissions, contact williampauljones@gmail.com
*/



(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.ItemMirror = factory();
    }
}(this, function () {
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

/**
 * Collection of exceptions associated with the XooML tools.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLExceptions
 * @static
 *
 * @protected
 */
define('XooMLExceptions',{
  /**
   * Thrown when a method is not yet implemented.
   *
   * @event NotImplementedException
   *
   * @protected
   */
  notImplemented: "NotImplementedException",

  /**
   * Thrown when a required property from a method's options is missing.
   *
   * @event MissingParameterException
   *
   * @protected
   */
  missingParameter: "MissingParameterException",

  /**
   * Thrown when an argument is given a null value when it does not accept null
   * values.
   *
   * @event NullArgumentException
   *
   * @protected
   */
  nullArgument: "NullArgumentException",

  /**
   * Thrown when an argument is given a value with a different type from the
   * expected type.
   *
   * @event InvalidTypeException
   *
   * @protected
   */
  invalidType: "InvalidTypeException",

  /**
   * Thrown when an a method is called when the object is in invalid state
   * given what the method expected.
   *
   * @event InvalidStateArgument
   *
   * @protected
   */
  invalidState: "InvalidStateArgument",

  /**
   * Thrown after receiving an exception from XooMLU Storage
   *
   * @event XooMLUException
   *
   * @protected
   */
  xooMLUException: "XooMLUException",

  /**
   * Thrown after receiving an exception from ItemU Storage
   *
   * @event ItemUException
   *
   * @protected
   */
  itemUException: "ItemUException",

  /**
   * Thrown after an association was upgraded that could not be upgraded.
   *
   * @event NonUpgradeableAssociationException
   *
   * @protected
   */
  nonUpgradeableAssociationException: "NonUpgradeableAssociationException",

  /**
   * Thrown after an argument was passed in an invalid state than expected.
   *
   * @event InvalidArgumentException
   *
   * @protected
   */
  invalidArgument: "InvalidOptionsException",

  /**
   * Thrown after expecting a file or folder not to exist when it does.
   *
   * @event FileOrFolderAlreadyExistsException
   *
   * @protected
   */
  itemAlreadyExists: "ItemAlreadyExistsException",

  /**
   * Thrown when expecting the ItemMirror to be current, and it is not.
   *
   * @event FileOrFolderAlreadyExistsException
   *
   * @protected
   */
  itemMirrorNotCurrent: "ItemMirrorNotCurrent"
});

/**
 * Configuration variables for XooML.js
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLConfig
 * @static
 *
 * @protected
 */
define('XooMLConfig',{
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
});

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
define('XooMLUtil',[
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

/**
 * A utility library for processing file paths. Handles any type of
 * file path so long as the separator is "/"
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class PathDriver
 *
 * @protected
 */
define('PathDriver',[
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil"
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

  /**
   * Takes two paths and joins them together.
   *
   * @method joinPath
   * @return {String} The two joined paths
   *
   * @param {String} root The root path to join
   * @param {String} leaf The leaf path to join
   *
   * @example
   *     joinPath('/foo/', '/bar/');
   *     // returns '/foo/bar/'
   *
   * @protected
   */
  self.joinPath = function (rootPath, leafPath) {
    var self = this;

    if (rootPath === _PATH_SEPARATOR) {
      return leafPath;
    }

    rootPath = self._stripTrailingSlash(rootPath);
    leafPath = self._stripLeadingSlash(leafPath);

    return rootPath + _PATH_SEPARATOR + leafPath;
  };

  /**
   * Takes an array of paths and joins them all together.
   *
   * Currently unimplemented and throws notImplemented exception if
   * called.
   
   * @method joinPathArrays
   *
   * @protected
   */
  self.joinPathArray = function (rootPath, leafPath) {
    throw XooMLExceptions.notImplemented;
  };

  /**
   * Splits a path into an array of the different folders in that
   * path; including the root if present.
   *
   * @method splitPath
   * @return {[String]} An array of split up paths
   *
   * @param {String} path The path to be split
   *
   * @example
   *     joinPath('/foo/bar/baz');
   *     // returns ['', 'foo', 'bar', 'baz']
   *
   * @protected
   */
  self.splitPath = function (path) {
    return path.split(_PATH_SEPARATOR);
  };

  /**
   * Formats a path by removing any trailing slashes.
   *
   * @method formatPath
   * @return {String} The well formatted path
   *
   * @param {String} path The path to be formatted
   *
   * @example
   *     format('/foo/bar/');
   *     // returns '/foo/bar'
   *
   * @protected
   */
  self.formatPath = function (path) {
    return self._stripTrailingSlash(path);
  };

  /**
   * @method isRoot
   * @return {Boolean} True if root, false otherwise
   *
   * @param {String} path Path to test for root
   *
   * @example
   *     format('/');
   *     // returns true, anything else will return false
   *
   * @protected
   */
  self.isRoot = function (path) {
    return path === _PATH_SEPARATOR;
  };

  /**
   * @method getPathSeparator
   * @return {String} The character that is used as a path separator
   *
   * @example
   *     getPathSeparator();
   *     // returns '/'
   *
   * @protected
   */
  self.getPathSeparator = function () {
    return _PATH_SEPARATOR;
  };

  /**
   * @method _stripTrailingSlash
   * @return {String} The path without any trailing slash
   *
   * @param {String} path
   *
   * @private
   */
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

  /**
   * @method _stripLeadingSlash
   * @return {String} The path without any leading slash
   *
   * @param {String} path
   *
   * @private
   */
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
 * AssociationEditor is a minimal interface to represent a XooML2
 * association. This object is used together with FragmentEditor to
 * fully reprsent a XooML fragment as javascript object. It can be
 * converted seamlessly between an object and XML.
 *
 * Note that upon construction, this doesn't actually create an
 * association, merely a /representation/ of an association.
 *
 * There are two ways to construct an AssociationEditor:
 * 1. Through a valid Association XML Element
 * 2. By specifying all data through an object
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class AssociationEditor
 * @constructor
 *
 * @param {Object} options The options specified for the constructor
 *  @param {Element} options.element A DOM element that correctly
 *  represents an association as specified by the XooML schema.
 *  @param {Object} options.commonData An object that specifies the
 *  data for an association. Look at the private constructor
 *  `_fromOptions` for more details
 *
 * @protected
 */
define('AssociationEditor',[
  "./XooMLExceptions",
  "./XooMLUtil"
], function(XooMLExceptions, XooMLUtil) {
  "use strict";

 var _ELEMENT_NAME = "association",
     _NAMESPACE_ELEMENT_NAME = "associationNamespaceElement",
     _ID_ATTR = "ID",
     _DISPLAY_TEXT_ATTR = "displayText",
     _ASSOCIATED_XOOML_FRAGMENT_ATTR = "associatedXooMLFragment",
     _ASSOCIATED_XOOML_DRIVER_ATTR = "associatedXooMLDriver",
     _ASSOCIATED_SYNC_DRIVER_ATTR = "associatedSyncDriver",
     _ASSOCIATED_ITEM_DRIVER_ATTR = "associatedItemDriver",
     _ASSOCIATED_ITEM_ATTR = "associatedItem",
     _LOCAL_ITEM_ATTR = "localItem",
     _IS_GROUPING_ATTR = "isGrouping";

  function AssociationEditor(options) {
    var self = this;

    if (options.element) {
      _fromElement(options.element, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, self);
    } else {
      console.log(XooMLExceptions.missingParameter);
    }
  }

  /**
   * Converts the object into an association element, which can then
   * be converted to a string or added to the DOM.
   *
   * @method toElement
   *
   * @returns {Element} A DOM element that can be further manipulated
   * with DOM methods
   *
   * @protected
   */
  AssociationEditor.prototype.toElement = function() {
    var self = this,
        // The We use a null namespace to leave it blank, otherwise it
        // sets it as XHTML and won't serialize attribute names properly.
        // The namespace will be inherited by the fragment it resides in.
        associationElem = document.createElementNS(null, _ELEMENT_NAME);

    // common data
    Object.keys(self.commonData).forEach( function(key) {
      if ( self.commonData[key] ) {// Don't set null attributes
        associationElem.setAttribute(key, self.commonData[key]);
      }
    });

    // namespace data
    Object.keys(self.namespace).forEach( function(uri) {
      var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
      // Attributes
      Object.keys(self.namespace[uri].attributes).forEach( function(attrName) {
        nsElem.setAttributeNS(uri, attrName, self.namespace[ uri ].attributes[ attrName ]);
      });
      // Data
      nsElem.textContent = self.namespace[ uri ].data;

      associationElem.appendChild(nsElem);
    });

    return associationElem;
  };

  /**
   * Takes an association element in XML and then converts that into
   * an AssociationEditor object. Intended to be one of the ways the
   * object is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   */
  function _fromElement(element, self) {
    var dataElems, i, uri, elem;
    // Sets all common data attributes
    self.commonData = {
      ID: element.getAttribute(_ID_ATTR),
      displayText: element.getAttribute(_DISPLAY_TEXT_ATTR),
      associatedXooMLFragment: element.getAttribute(_ASSOCIATED_XOOML_FRAGMENT_ATTR),
      associatedXooMLDriver: element.getAttribute(_ASSOCIATED_XOOML_DRIVER_ATTR),
      associatedSyncDriver: element.getAttribute(_ASSOCIATED_SYNC_DRIVER_ATTR),
      associatedItemDriver: element.getAttribute(_ASSOCIATED_ITEM_DRIVER_ATTR),
      associatedItem: element.getAttribute(_ASSOCIATED_ITEM_ATTR),
      localItem: element.getAttribute(_LOCAL_ITEM_ATTR),
      // We use JSON.parse to get the value as a boolean, not as a string
      isGrouping: JSON.parse(element.getAttribute(_IS_GROUPING_ATTR))
    };

    self.namespace = {};

    dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME);
    for (i = 0; i < dataElems.length; i += 1) {
      elem = dataElems[i];
      uri = elem.namespaceURI;

      /**
       * The information for a given namespace. Includes both the
       * data, and the attributes. Namespaces URIs must be unique or
       * they will overwrite data from another namespace
       * @property namespace.URI
       * @type Object
       */
      self.namespace[ uri ] = {};
      self.namespace[ uri ].attributes = {};

      for (i = 0; i < elem.attributes.length; i += 1) {
        // We have to filter out the special namespace attribute We
        // let the namespace methods handle the namespace, and we
        // don't deal with it
        if (elem.attributes[i].name !== "xmlns") {
          /**
           * The attributes of the current namespace, with each attribute
           * having a corresponding value.
           * @property namespace.URI.attributes
           * @type Object
           */
          self.namespace[ uri ].attributes[ elem.attributes[i].localName ] =
            elem.getAttributeNS(uri, elem.attributes[i].localName );
        }
      }

    /**
     * This is the namespace data stored within the namespace
     * element. Anything can be put here, and it will be stored as a
     * string. ItemMirror will not do anything with the data here and
     * doesn't interact with it at all. It is the responsibility of
     * other applications to properly store information here.
     * @property namespace.URI.data
     * @type String
     */
      self.namespace[ uri ].data = elem.textContent;
    }
  }

  /**
   * Constructs an association with data from an object
   * @method _fromOptions
   *
   * @param {Object} commonData Common data that is used by the
   * itemMirror library, and is app agnostic
   *  @param {String} commonData.displayText Display text for the
   *  association
   *  @param {String} commonData.associatedXooMLFragment URI of the
   *  associated XooML fragment for the association
   *  @param {String} commonData.associatedItem URI of the associated item
   *  @param {String} commonData.associatedXooMLDriver The associated
   *  XooML driver for the association
   *  @param {String} commonData.associatedItemDriver The associated
   *  item driver for the association
   *  @param {String} commonData.associatedSyncDriver The associated
   *  sync driver of the association
   *  @param {String} commonData.localItem The name/id of the
   *  association
   *  @param {Boolean} comnmonData.isGrouping Whether or not the
   *  association is a grouping item
   *  @param {String} commonData.readOnlyURLtoXooMLfragment Used in
   *  cases where the owner wishes for the XooML fragment representing
   *  an item to be public
   * @protected
   * @private
   */
  function _fromOptions(commonData, self) {
    if (!commonData) {
      throw XooMLExceptions.nullArgument;
    }

    // Properties from the common data
    /**
     * Common Data of the association that is accessible to all applications
     * @property commonData
     * @type Object
     */
    self.commonData = {
      /**
       * Text that describes the association
       * @property commonData.displayText
       * @type String
       */
      displayText: commonData.displayText || null,

      /**
       * The associated XooML fragment of the association
       * @property commonData.associatedXooMLFragment
       * @type String
       */
      associatedXooMLFragment: commonData.associatedXooMLFragment || null,

      /**
       * The associated XooML driver of the association
       * @property commonData.associatedXooMLDriver
       * @type String
       */
      associatedXooMLDriver: commonData.associatedXooMLDriver || null,

      /**
       * The associated sync driver of the association
       * @property commonData.associatedSyncDriver
       * @type String
       */
      associatedSyncDriver: commonData.associatedSyncDriver || null,

      /**
       * The associated item driver of the association
       * @property commonData.associatedItemDriver
       * @type String
       */
      associatedItemDriver: commonData.associatedItemDriver || null,

      /**
       * The associated item of the association
       * @property commonData.associatedItem
       * @type String
       */
      associatedItem: commonData.associatedItem || null,

      /**
       * The local item of the association
       * @property commonData.localItem
       * @type String
       */
      localItem: commonData.localItem || null,

      /**
       * Whether or not the item is a grouping item
       * @property commonData.isGrouping
       * @type Boolean
       */
      isGrouping: commonData.isGrouping || false,

      /**
       * The GUID of the association
       * @property commonData.ID
       * @type String
       */
      // GUID is generated upon construction
      ID: XooMLUtil.generateGUID()
    };

    /**
     * Data for the namespaces. Stored as a key pair value, with each
     * namespace referencing the namespace association element for the
     * corresponding namespace.
     *
     * @property namespace
     * @type Object
     */
    self.namespace = {};
    /**
     * The attributes of the current namespace, with each attribute
     * having a corresponding value.
     * @property namespace.URI.attributes
     * @type Object
     */

    /**
     * This is the namespace data stored within the namespace
     * element. Anything can be put here, and it will be stored as a
     * string. ItemMirror will not do anything with the data here and
     * doesn't interact with it at all. It is the responsibility of
     * other applications to properly store information here.
     *
     * @property namespace.URI.data
     * @type String
     */
  }

  return AssociationEditor;
});

/**
 * An item utility interacts with the item storage and is responsible for
 * creating and deleting items. This is an implementation of item utility
 * using Dropbox as the item storage.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class ItemDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new ItemU with
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 *
 * @protected
 */
define('ItemDriver',[
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil",
  "./AssociationEditor"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  AssociationEditor) {
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   *
   * @protected
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
   * @param {Function} callback(output) Function to be called when self function is finished with it's operation. Output is an array of AssociationEditors.
   *
   * @protected
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
          output.push(new AssociationEditor({
            commonData: { displayText: listStat[i].name,
                          isGrouping: listStat[i].isFolder,
                          localItem: listStat[i].name,
                          associatedItem: listStat[i].isFolder ? listStat[i].path : null
                        }
          }));
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
   *
   * @protected
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
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLDriver
 * @constructor
 *
 * @param {Object} options Data to construct a new XooMLU with
 * @param {String} options.fragmentURI The URI of fragment
 * contains the XooML
 * @param {String} options.utilityURI URI of the utility
 * @param {Object} options.dropboxClient Authenticated dropbox client
 *
 * @protected
 */
define('XooMLDriver',[
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var
    _CONSTRUCTOR_OPTIONS = {
      driverURI:   true,
      dropboxClient: true,
      fragmentURI: true
    };

  /**
   * Constructs a XooMLDriver for reading/writing XooML fragment.
   *
   * @protected
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
    self._fragmentURI = options.fragmentURI;

    if (self._checkDropboxAuthenticated(self._dropboxClient)) {
      return callback(false, self);
    } else {
      self._dropboxClient.authenticate(function (error, client) {
        if (error) {
          return callback(XooMLExceptions.xooMLUException, null);
        }
        return callback(false, self);
      });
    }
  }

  /**
   * Reads and returns a XooML fragment
   * @method getXooMLFragment
   * @param {Function} callback(content) Function to be called when self function is finished with it's operation. content is the content of the XooML fragment.
   *
   * @protected
   */
  XooMLDriver.prototype.getXooMLFragment = function (callback) {
    var self = this;

    self._dropboxClient.readFile(self._fragmentURI, function (error, content) {
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
   *
   * @protected
   */
  XooMLDriver.prototype.setXooMLFragment = function (fragment, callback) {
    var self = this;

    // We manually subistitue newlines with the proper XML
    // representation for them because XMLSerializer doesn't seem to
    // be DOM compliant.
    // See: http://stackoverflow.com/questions/2004386/how-to-save-newlines-in-xml-attribute
    fragment = fragment.replace(/\n/g, "&#10;");

    self._dropboxClient.writeFile(self._fragmentURI, fragment, function (error, stat) {
      if (error) {
        return self._showDropboxError(error, callback);
      }
      return callback(false, stat);
    });

  };

  /**
   * Check if the XooML fragment exists
   * @method checkExists
   * @param {Function} callback Function to be called when
   * self function is finished with it's operation.
   *  @param {String} callback.error Dropbox error if there is one
   *  @param {Boolean} callback.result True if the fragment exists and
   *  false otherwis
   *
   * @protected
   */
  XooMLDriver.prototype.checkExists = function (callback) {
    var self = this, result;

    self._dropboxClient.stat(self._fragmentURI, function (error, stat) {
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

  XooMLDriver.prototype._showDropboxError = function (error, callback) {
    return callback(error.status);
  };

  XooMLDriver.prototype._checkDropboxAuthenticated = function (dropboxClient) {
    return dropboxClient.authState === 4;
  };

  return XooMLDriver;
});






/**
 * Constructs a FragmentWrapper for a XooML fragment. In the following cases.
 *
 * 1. XooMLFragment String is passed in and is used as the XooMLFragment
 * 2. XooMLFragment Element is passed in and is used as the XooMLFragment.
 * 2. Associations, XooMLDriver, ItemDriver, SyncDriver,
 * groupingItemURI are given and used to create a new XooMLFragment with
 * the given data.
 *
 * The FragmentWrapper is merely a representation of a XooML fragment,
 * and is used by an itemMirror that actually handles the details of
 * creating deleting and modifying associations.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class FragmentEditor
 * @constructor
 *
 * @param {Object} options Data to construct a new FragmentWrapper with
 *  @param {String} options.text Unparsed XML directly from a storage
 *  platform.
 *  @param {Element} options.element XML Element representing a XooML
 *                   fragment. Required for case 1.
 *  @param {AssociationEditor[]} options.associations List of associations for
 *          the newly constructed XooMLFragment in case 2. <br/>__optional__
 *  @param {Object} options.commonData Common data for the
 *  fragment. Look at the constructor for more details. Required for case 2
 *  @param {String} options.groupingItemURI The URI for the grouping
 *  item of the fragment. Required for case 2.
 *
 * @protected
 **/
define('FragmentEditor',[
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil",
  "./PathDriver",
  "./AssociationEditor"
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  AssociationEditor) {
  "use strict";

  var _ELEMENT_NAME = "fragment",
      _ASSOCIATION_ELEMENT_NAME = "association",
      _ASSOCIATION_ID_ATTR = "ID",
      _NAMESPACE_ELEMENT_NAME = "fragmentNamespaceElement",
      _SCHEMA_VERSION_ATTR = "schemaVersion",
      _SCHEMA_LOCATION_ATTR = "schemaLocation",
      _ITEM_DESCRIBED_ATTR = "itemDescribed",
      _DISPLAY_NAME_ATTR = "displayName",
      _ITEM_DRIVER_ATTR = "itemDriver",
      _SYNC_DRIVER_ATTR = "syncDriver",
      _XOOML_DRIVER_ATTR = "xooMLDriver",
      _GUID_ATTR = "GUIDGeneratedOnLastWrite",
      _ITEM_MIRROR_NS = "http://kftf.ischool.washington.edu/xmlns/xooml";

  function FragmentEditor(options) {
    var self = this;

    if (options.text) {
      _fromString(options.text, self);
    } else if (options.element) {
      _fromElement(options.element, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, options.associations, self);
    } else {
      console.log(XooMLExceptions.missingParameter);
    }
  }

  /**
   * Updates the GUID of the Fragment
   *
   * @method updateID
   * @return {String} The new GUID of the fragment
   * @private
   * @protected
   */
  FragmentEditor.prototype.updateID = function() {
    var self = this, guid;

    guid = XooMLUtil.generateGUID();
    this.commonData.GUIDGeneratedOnLastWrite = guid;
    return guid;
  };

  /**
   * Converts a FragmentEditor object into an XML element, which can
   * then be serialized and saved as a string, or further manipulated
   * with DOM methods
   * @method toElement
   * @return {Element} The XooML fragment as an XML element
   * @protected
   */
  FragmentEditor.prototype.toElement = function() {
    var self = this,
        fragmentElem = document.createElementNS(_ITEM_MIRROR_NS, _ELEMENT_NAME);

    // common data
    Object.keys(self.commonData).forEach( function(attrName) {
      var attrValue = self.commonData[attrName];
      if (attrValue) { // Don't set null attributes
        fragmentElem.setAttribute(attrName, attrValue);
      }
    });

    // namespace data
    Object.keys(self.namespace).forEach( function(uri) {
      var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
      // Attributes
      Object.keys(self.namespace[uri].attributes).forEach( function(attrName) {
        nsElem.setAttributeNS(uri, attrName, self.namespace[ uri ].attributes[ attrName ]);
      });

      nsElem.textContent = self.namespace[ uri ].data;

      fragmentElem.appendChild(nsElem);
    });

    // associations
    Object.keys(self.associations).forEach( function(id) {
      fragmentElem.appendChild( self.associations[id].toElement() );
    });

    return fragmentElem;
  };

  /**
   * Returns the XML of a fragment as a string, _not_ the string
   * version of the object. This is used for persisting the fragment
   * across multiple platforms
   * @method toString
   * @return {String} Fragment XML
   */
  FragmentEditor.prototype.toString = function() {
    var serializer = new XMLSerializer();
    return serializer.serializeToString( this.toElement() );
  };

  /**
   * Constructs a fragmentEditor based on data passed into the
   * parameters
   *
   * @method _fromOptions
   *
   * @param {Object} commonData An object containing common data for the association
   *  @param {String} commonData.schemaVersion The version of the schema <br/> __required__
   *  @param {String} commonData.schemaLocation The location of the schema
   *  @param {String} commonData.itemDescribed URI pointing to item for which the
   *  XooML fragment is metadata.
   *  @param {String} commonData.displayName Display name of the fragment
   *  @param {String} commonData.itemDriver The URI of the item driver for the fragment
   *  @param {String} commonData.syncDriver The URI of the sync driver for the fragment
   *  @param {String} commonData.xooMLDriver The URI of the XooML driver for the fragment
   *  @param {String} commonData.GUIDGeneratedOnLastWrite The GUID generated the last time the fragment was written
   * @param {AssociationEditor[]} associations An array of associations that the fragment has
   * @param {String} namespace The namespace URI that an app will use for it's own private data
   * @param {FragmentEditor} self
   *
   * @private
   */
  function _fromOptions(commonData, associations, self) {
    if (!commonData) {
      throw XooMLExceptions.nullArgument;
    }

    // Properties from the common data
    /**
     * Common Data of the association that is accessible to all applications
     * @property commonData
     * @type Object
     */
    self.commonData = {
      /**
       * Text that describes the fragment
       * @property commonData.displayName
       * @type String
       */
      displayName: commonData.displayName || null,

      /**
       * The schema location for the fragment
       * @property commonData.schemaLocation
       * @type String
       */
      schemaLocation: commonData.schemaLocation || null,

      /**
       * The schema version for the fragment
       * @property commonData.schemaVersion
       * @type String
       */
      schemaVersion: commonData.schemaVersion || null,

      /**
       * The item driver URI for the fragment
       * @property commonData.itemDriver
       * @type String
       */
      itemDriver: commonData.itemDriver || null,

      /**
       * The item described for the fragment. This is a URI that
       * points to grouping item from wich the itemMirror was created
       * @property commonData.
       * @type String
       */
      itemDescribed: commonData.itemDescribed || null,

      /**
       * The sync driver URI for the fragment
       * @property commonData.syncDriver
       * @type String
       */
      syncDriver: commonData.syncDriver || null,

      /**
       * The XooML driver URI for the fragment
       * @property commonData.xooMLDriver
       * @type String
       */
      xooMLDriver: commonData.xooMLDriver || null,

      /**
       * The unique GUID for the fragment that is updated after every
       * write
       * @property commonData.GUIDGeneratedOnLastWrite
       * @type String
       */
      GUIDGeneratedOnLastWrite: XooMLUtil.generateGUID()
    };

    /**
     * The associations of the fragment. Each association is accessed
     * by referencing it's ID, which then gives the corresponding
     * AssociationEditor object for manipulating that association.
     * @property associations
     * @type Object
     */
    // Takes the association array and turns it into an associative
    // array accessed by the GUID of an association
    self.associations = {};
    associations.forEach( function(assoc) {
      var guid = assoc.commonData.ID;
      self.associations[guid] = assoc;
    });


    /**
     * The namespace data of the fragment. Holds both the URI as well
     * as the namespace specific data for the fragment
     * @property namespace
     * @type Object
     */
    self.namespace = {};
      /**
       * The namespace URI for the fragment. Used to set namespace data
       * for both the fragment and it's associations
       * @property namespace.uri
       * @type String
       */

      /**
       * The attributes of the namespace. This is app specific data
       * that is set for the fragment. Each key pair in the object
       * represents an attribute name and it's corresponding value
       * @property namespace.attributes
       * @type Object
       */
  }

  /**
   * Takes a fragment in the form of a string and then parses that
   * into XML. From there it converts that element into an object
   * using the _fromElement method
   *
   * @param {String} text The text representing the fragment. Should
   * be obtained directly from a storage platform like dropbox or a
   * local filesystem
   * @param {String} namespace The URI of the namespace that will
   * initially be used for the fragment when handling any namespace
   * data
   * @param {FragmentEditor} self
   */
  function _fromString(text, namespace, self) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, "application/xml");
    _fromElement(doc.children[0], namespace, self);
  }

  /**
   * Takes a fragment element in XML and then converts that into a
   * FragmentEditor object. Intended to be one of the ways the object
   * is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   * @param {FragmentEditor} self
   * @private
   */
  function _fromElement(element, self) {
    var dataElems, nsElem, i, associationElems, guid, elem, uri;
    // Sets all common data attributes
    self.commonData = {
      fragmentNamespaceElement: element.getAttribute(_NAMESPACE_ELEMENT_NAME),
      schemaVersion: element.getAttribute(_SCHEMA_VERSION_ATTR),
      schemaLocation: element.getAttribute(_SCHEMA_LOCATION_ATTR),
      itemDescribed: element.getAttribute(_ITEM_DESCRIBED_ATTR),
      displayName: element.getAttribute(_DISPLAY_NAME_ATTR),
      itemDriver: element.getAttribute(_ITEM_DRIVER_ATTR),
      syncDriver: element.getAttribute(_SYNC_DRIVER_ATTR),
      xooMLDriver: element.getAttribute(_XOOML_DRIVER_ATTR),
      GUIDGeneratedOnLastWrite: element.getAttribute(_GUID_ATTR)
    };

    /**
     * The namespace object is an associated array with each key being
     * a namespace URI. These can thene be used to modify fragment
     * namespace attributes and data
     * @property namespace
     * @type Object
     */
    self.namespace = {};

    dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME);
    for (i = 0; i < dataElems.length; i += 1) {
      elem = dataElems[i];
      uri = elem.namespaceURI;

      /**
       * The information for a given namespace. Includes both the
       * data, and the attributes. Namespaces URIs must be unique or
       * they will overwrite data from another namespace
       * @property namespace.URI
       * @type Object
       */
      self.namespace[ uri ] = {};
      self.namespace[ uri ].attributes = {};

      for (i = 0; i < elem.attributes.length; i += 1) {
        // We have to filter out the special namespace attribute We
        // let the namespace methods handle the namespace, and we
        // don't deal with it
        if (elem.attributes[i].name !== "xmlns") {
          /**
           * The attributes of the current namespace, with each attribute
           * having a corresponding value.
           * @property namespace.URI.attributes
           * @type Object
           */
          self.namespace[ uri ].attributes[ elem.attributes[i].localName ] =
            elem.getAttributeNS(uri, elem.attributes[i].localName);
        }
      }

    /**
     * This is the namespace data stored within the namespace
     * element. Anything can be put here, and it will be stored as a
     * string. ItemMirror will not do anything with the data here and
     * doesn't interact with it at all. It is the responsibility of
     * other applications to properly store information here.
     * @property namespace.URI.data
     * @type String
     */
      self.namespace[ uri ].data = elem.textContent;
    }

    // associations
    self.associations = {};
    associationElems = element.getElementsByTagName(_ASSOCIATION_ELEMENT_NAME);
    for (i = 0; i < associationElems.length; i += 1) {
      guid = associationElems[i].getAttribute(_ASSOCIATION_ID_ATTR);
      self.associations[guid] = new AssociationEditor({
        element: associationElems[i]
      });
    }
  }

  return FragmentEditor;
});

/**
 * An implementation of SyncDriver which syncronizes the XooML so that
 * it reflects the storage. This implementation ensures that only the
 * XooML is modified, and that the user's storage is never modified,
 * safely protecting any data.
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class SyncDriver
 *
 * @constructor
 * @param {Object} itemMirror The itemMirror object which you wish to
 * synchronize
 *
 * @protected
 */
define('SyncDriver',[
  "./XooMLDriver",
  "./XooMLExceptions",
  "./XooMLConfig",
  "./XooMLUtil",
  "./FragmentEditor",
  "./AssociationEditor"
], function(
  XooMLDriver,
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  FragmentEditor,
  AssociationEditor) {
  "use strict";

  var self;

  function SyncDriver(itemMirror) {
    var self = this;
    self._itemMirror = itemMirror;
    self._itemDriver = itemMirror._itemDriver;
    self._xooMLDriver = itemMirror._xooMLDriver;


  }

  /**
   * Helper method that allows for sorting of objects by the localItem
   *
   * @method _nameCompare
   * @private
   * @protected
   */
  function _localItemCompare(a, b) {
    if (a.commonData.localItem > b.commonData.localItem) return 1;
    else if (a.commonData.localItem < b.commonData.localItem) return -1;
    else return 0;
  }

  /**
   * Synchonizes the itemMirror object.
   *
   * @method sync
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *
   * @protected
   */
  SyncDriver.prototype.sync = function(callback) {
    var self = this,
        itemAssociations;

    self._itemDriver.listItems(self._itemMirror._groupingItemURI,
                               processItems);

    function processItems(error, associations){
      if (error) return callback(error);

      itemAssociations = associations;
      self._xooMLDriver.getXooMLFragment(processXooML);
    }

    function processXooML(error, xooMLContent) {
      // A 404 error is dropbox telling us that the file doesn't
      // exist. In that case we just write the file
      if (error === 404) {
        var fragmentString = self._itemMirror._fragment.toString();
        return self._xooMLDriver.setXooMLFragment( fragmentString, function(error) {
          if (error) callback(error);
          else callback(false);
        });
      } else if (error) {
        return callback(error);
      }

      // Keeps track of the index in the xooMLassociations so that
      // we don't waste time searching from the beginning
      var xooMLIdx = 0;
      // Keeps track of whether there are any changes that need to be made
      var synchronized = true;
      var xooMLAssociations;

      self._fragmentEditor = new FragmentEditor({text: xooMLContent});

      xooMLAssociations = Object.keys(self._fragmentEditor.associations)
      // Turns the associative array into a regular array for iteration
        .map( function(guid) {
          return self._fragmentEditor.associations[guid];
        })
      // filters out any phantoms
	.filter( function(assoc) {
	  return assoc.commonData.localItem !== null;
	});

      // No guarantee that the storage API sends results sorted
      itemAssociations.sort(_localItemCompare);
      xooMLAssociations.sort(_localItemCompare);

      // Gets the localItems in a separate array, but in needed sorted order
      var itemLocals = itemAssociations.map( function (assoc) {return assoc.commonData.localItem;} );
      var xooMLLocals = xooMLAssociations.map( function (assoc) {return assoc.commonData.localItem;} );

      itemLocals.forEach( function(localItem, itemIdx) {
	var search = xooMLLocals.lastIndexOf(localItem, xooMLIdx);
	// Create association
	if (search === -1) {
	  synchronized = false;
	  // Case 6/7 only, other cases won't be handled
          var association = itemAssociations[itemIdx];
          self._fragmentEditor.associations[association.commonData.ID] = association;
	} else {
	  // Deletes any extraneous associations
	  xooMLAssociations
	    .slice(xooMLIdx, search)
	    .forEach( function(assoc) {
	      synchronized = false;
              delete self._fragmentEditor.associations[assoc.guid];
	    });
	  xooMLIdx = search + 1;
	}
      });
      // Any remaining associations need to be deleted because they don't exist
      xooMLAssociations
	.slice(xooMLIdx, xooMLLocals.length)
	.forEach( function(assoc) {
	  synchronized = false;
          delete self._fragmentEditor.associations[assoc.commonData.ID];
	});

      // Only save fragment if needed
      if (!synchronized) {
        self._fragmentEditor.updateID(); // generate a new guid for GUIDGeneratedOnLastWrite;
        // Writes out the fragment
        self._xooMLDriver.setXooMLFragment(self._fragmentEditor.toString(), function(error) {
          if (error) return callback(error);

          return callback(false);
        });
      } else return callback(false);
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
define('ItemMirror',[
  './XooMLExceptions',
  './XooMLConfig',
  './XooMLUtil',
  './PathDriver',
  './ItemDriver',
  './XooMLDriver',
  './SyncDriver',
  './FragmentEditor',
  './AssociationEditor'
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil,
  PathDriver,
  ItemDriver,
  XooMLDriver,
  SyncDriver,
  FragmentEditor,
  AssociationEditor) {
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

   var self = this, xooMLFragmentURI, displayName;

    // private variables
    self._xooMLDriver = null;
    self._itemDriver = null;
    self._syncDriver = null;
    self._creator = options.creator || null;
    self._groupingItemURI = PathDriver.formatPath(options.groupingItemURI);
    self._newItemMirrorOptions = options;

    // displayName for the fragment
    if (PathDriver.isRoot(self._groupingItemURI)) {
      // This obviously will need to be changed when multiple driver
      // support is implemented
      displayName = "Dropbox";
    } else {
      displayName = PathDriver.formatPath(self._groupingItemURI);
      displayName = PathDriver.splitPath(displayName);
      displayName = displayName[displayName.length - 1];
    }

    xooMLFragmentURI = PathDriver.joinPath(self._groupingItemURI, XooMLConfig.xooMLFragmentFileName);
    options.xooMLDriver.fragmentURI = xooMLFragmentURI;
    // First load the XooML Driver
    new XooMLDriver(options.xooMLDriver, loadXooMLDriver);

    function loadXooMLDriver(error, driver) {
      if (error) return callback(error);

      self._xooMLDriver = driver; // actually sets the XooMLDriver

      self._xooMLDriver.getXooMLFragment(processXooML);
    }

    function processXooML(error, fragmentString) {
      // Case 2: Since the fragment doesn't exist, we need
      // to construct it by using the itemDriver
      if (error === 404) new ItemDriver(options.itemDriver, createFromItemDriver);
      else if (error) return callback(error);

      // Case 1: It already exists, and so all of the information
      // can be constructed from the saved fragment
      else {
        createFromXML(fragmentString);
      }
    }

    function createFromXML(fragmentString) {
      console.log("Constructing from XML");
      self._fragment = new FragmentEditor({text: fragmentString});

      // Need to load other stuff from the fragment now
      var syncDriverURI = self._fragment.commonData.syncDriver,
          itemDriverURI = self._fragment.commonData.itemDriver;

      new ItemDriver(options.itemDriver, function(error, driver) {
        if (error) return callback(error);
        self._itemDriver = driver;

        self._syncDriver = new SyncDriver(self);

        // Do a refresh in case something has been added or deleted in
        // the directory since the last write
        self.refresh(function(error) {
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
        if (error) console.log(error);
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
   * @method getURIforItemDescribed
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
    var self = this,
        isGrouping,
        xooMLOptions,
        itemOptions,
        syncOptions,
        uri;

    // Need to change this so that it instead points to the fragmentURI field
    uri = PathDriver.joinPath(self.getAssociationAssociatedItem(GUID), "XooML2.xml");

    itemOptions = {
      driverURI: "DropboxItemUtility",
      dropboxClient: self._xooMLDriver._dropboxClient
    };
    xooMLOptions = {
      fragmentURI: uri,
      driverURI: "DropboxXooMLUtility",
      dropboxClient: self._xooMLDriver._dropboxClient
    };
    syncOptions = {
      utilityURI: "MirrorSyncUtility"
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
        console.log(error);
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
        path,
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
          associatedItem: PathDriver.joinPath(self.getURIforItemDescribed(), options.localItem)
        }
      });

      // Now we use the itemDriver to actually create the folder
      path = PathDriver.joinPath(self._groupingItemURI, association.commonData.localItem);
      self._itemDriver.createGroupingItem(path, function(error){
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

    // Save to ensure that the fragment is up to date
    return self.save(deleteContent);

    function deleteContent(error) {
      if (error) return callback(error);

      var isPhantom = self.isAssociationPhantom(GUID);

      if (!isPhantom) {
        var isGrouping = self.isAssociationAssociatedItemGrouping(GUID),
            localItem = self.getAssociationLocalItem(GUID),
            path = PathDriver.joinPath(self._groupingItemURI, localItem);

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

      var localItem = self.getAssociationLocalItem(GUID),
          oldPath = PathDriver.joinPath(self._groupingItemURI, localItem),
          newPath = PathDriver.joinPath(self._groupingItemURI, newName);

      self._itemDriver.moveItem(oldPath, newPath, postMove);
    }

    function postMove(error) {
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

    self._xooMLDriver.getXooMLFragment(afterXooML);

    function afterXooML(error, content){
      if (error) return callback(error);

      var tmpFragment = new FragmentEditor({text: content});
      self._fragment.updateID();
      return self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
        if (error) return callback(error);
        return callback(false);
      });
    }
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

  return ItemMirror;
});

    return require('ItemMirror');
}));