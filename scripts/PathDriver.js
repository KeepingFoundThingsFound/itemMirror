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
define([
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
