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
define([
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

          return callback(XooMLExceptions.itemMirrorNotCurrent);
        });
      } else return callback(false);
    }
  };

  return SyncDriver;
});
