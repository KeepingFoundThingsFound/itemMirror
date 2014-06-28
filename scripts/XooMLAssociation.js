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
 *
 * @protected
 */
define([
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
