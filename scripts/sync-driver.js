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

'use strict'

var FragmentEditor = require('./fragment-editor')

/**
 * @class SyncDriver
 * @property {XooMLDriver} xooMLDriver
 * @property {string} guid The guid generated on last write by the itemMirror
 * instance.
 * @param {ItemMirror} itemMirror The calling ItemMirror instance should pass
 * itself. This is really just so that we can pass the XooMLDriver associated
 * with it, as well as the GUID
 */
function SyncDriver (itemMirror) {
  // Assigns the xooml driver as a property for easy access
  this.xooMLDriver = itemMirror._xooMLDriver
  this.itemMirror = itemMirror
  this.guid = itemMirror._fragment.commonData.GUIDGeneratedOnLastWrite
}

/**
 * Synchonizes the itemMirror object, or fails trying
 *
 * @method sync
 * @returns {Promise} Returns a promise that resolves when the itemMirror
 * object is synchonized. If a sync fails (because the
 * GUIDGeneratedOnLastWrite) differs between itemMirrors, then the promise
 * will be an _error_
 */
SyncDriver.prototype.sync = function () {
  var self = this
  // Use the xoomldriver to get the 'latest' version of the XML as it's
  // persisted
  return this.xooMLDriver.getXooMLFragment(function (xml) {
    // With the parsed the XML, and get the GUIDGeneratedOnLastWrite
    var fragment = new FragmentEditor({ 'text': xml })
    if (fragment.commonData.GUIDGeneratedOnLastWrite === self.guid) {
      return // Yay, everything is in sync!
    } else {
      throw new Error('Sync Error')
    }
  })
}

module.exports = SyncDriver
