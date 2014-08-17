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

   /**
    * Helper method that allows for sorting of objects by the name key
    *
    * @method _nameCompare
    * @private
    * @protected
    */
    function _nameCompare(a, b) {
      if (a.name > b.name) return 1;
      else if (a.name < b.name) return -1;
      else return 0;
    }
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
      if (error) {
	return callback(error);
      }

      itemAssociations = associations.map(
	function(assoc) {
	  return { name: assoc.commonData.localItem,
		   groupingItem: assoc.commonData.isGrouping };
	}
      );

      self._xooMLDriver.getXooMLFragment(processXooML);
    }

    function processXooML(error, xooMLContent) {
      if (error) return callback(error);

      // Keeps track of the index in the xooMLassociations so that
      // we don't waste time searching from the beginning
      var xooMLIdx = 0;
      // Keeps track of whether there are any changes that need to be made
      var synchronized = true;
      var xooMLAssociations;

      self._fragmentEditor = new FragmentEditor({text: xooMLContent});

      // Associations with both names and guids
      // filters out any phatoms
      xooMLAssociations = Object.keys(self._fragmentEditor.associations)
	.map( function(guid) {
	  return { guid: guid,
		   name: self._itemMirror.getAssociationLocalItem(guid),
                   groupingItem: self._itemMirror.isAssociationAssociatedItemGrouping(guid) };
	})
	.filter( function(assoc) {
	  return assoc.name !== null;
	});

      // No guarantee that the storage API sends results sorted
      itemAssociations.sort(self._nameCompare);
      xooMLAssociations.sort(self._nameCompare);

      // Gets the names a separate array, but in needed sorted order
      var itemNames = itemAssociations.map( function (assoc) {return assoc.name;} );
      var xooMLNames = xooMLAssociations.map( function (assoc) {return assoc.name;} );


      itemNames.forEach( function(name, itemIdx) {
	var search = xooMLNames.indexOf(name, xooMLIdx);
	// Create association
	if (search === -1) {
	  synchronized = false;
	  // Case 6/7 only, other cases won't be handled
          var association = new AssociationEditor({
            commonData: {
	      displayText: name,
	      localItem: name,
	      isGroupingItem: itemAssociations[itemIdx].groupingItem
            }
          });
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
	.slice(xooMLIdx, xooMLNames.length)
	.forEach( function(assoc) {
	  synchronized = false;
          delete self._fragmentEditor.associations[assoc.guid];
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
