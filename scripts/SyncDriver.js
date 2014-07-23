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
  "./XooMLExceptions.js",
  "./XooMLConfig.js",
  "./XooMLUtil.js",
], function(
  XooMLExceptions,
  XooMLConfig,
  XooMLUtil) {
  "use strict";

  var self;

  function SyncDriver(itemMirror) {
    var self = this;
    self._itemMirror = itemMirror;
    self._fragmentEditor = itemMirror._fragmentEditor;
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
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    }
  }

  self = SyncDriver.prototype;

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
  self.sync = function(callback) {
    var self = this,
        items,
        realAssociations,
        memoryAssociations,
        realNames,
        memoryNames,
        memoryIdx,
	search,
        sychronized;

    self._itemDriver.listItems(
      self._itemMirror._groupingItemURI,
      function (error, associations){
	if (error) {
	  return callback(error);
	}

	realAssociations = associations.map(
	  function(assoc) {
	    return { name: assoc.getDisplayText(),
		     groupingItem: assoc.getIsGroupingItem() };
	  }
	);

	// Associations with both names and guids
	// filters out any phatoms
	memoryAssociations = self._itemMirror.listAssociations()
	  .map( function(guid) {
	    return { guid: guid,
		     name: self._itemMirror.getAssociationLocalItemName(guid) };
	  })
	  .filter( function(assoc) {
	    return assoc.name !== null;
	  });

	// No guarantee that the storage API sends results sorted
	realAssociations.sort(self._nameCompare);
	memoryAssociations.sort(self._nameCompare);

	// Gets the names a separate array, but in needed sorted order
	realNames = realAssociations.map( function (assoc) {return assoc.name;} );
	memoryNames = memoryAssociations.map( function (assoc) {return assoc.name;} );

        // Keeps track of the index in the memoryassociations so that
        // we don't waste time searching from the beginning
	memoryIdx = 0;
	// Keeps track of whether there are any changes that need to be made
	sychronized = true;

	realNames.forEach( function(name, realIdx) {
	  search = memoryNames.indexOf(name, memoryIdx);
	  // Create association
	  if (search === -1) {
	    sychronized = false;
	    // Case 6/7
	    self._fragmentEditor.createAssociation({
	      displayText: name,
	      itemName: name,
	      isGroupingItem: realAssociations[realIdx].isGroupingItem
	    });
	  } else {
	    // Deletes any extraneous associations
	    memoryAssociations
	      .slice(memoryIdx, search)
	      .forEach( function(assoc) {
		sychronized = false;
		self._fragmentEditor.deleteAssociation(assoc.guid);
	      });

	    memoryIdx = search;
	  }
	});

	// Any remaining associations need to be deleted because they don't exist
	memoryAssociations
	  .slice(memoryIdx, memoryNames.length)
	  .forEach( function(assoc) {
	    sychronized = false;
	    self._fragmentEditor.deleteAssociation(assoc.guid);
	  });

	// Only save fragment if needed
	if (!sychronized) {
	  self._itemMirror._saveFragment(callback);
	}

        return callback;
      });
  };

  return SyncDriver;
});
