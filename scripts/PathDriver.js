define([
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