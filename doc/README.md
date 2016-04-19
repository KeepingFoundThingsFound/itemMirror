# ItemMirror

<!-- div class="toc-container" -->

<!-- div -->

## `Properties`
* <a href="#getcreator">`getCreator`</a>
* <a href="#getdisplayname">`getDisplayName`</a>
* <a href="#getpublicurl">`getPublicURL`</a>
* <a href="#getschemalocation">`getSchemaLocation`</a>
* <a href="#getschemaversion">`getSchemaVersion`</a>
* <a href="#geturiforitemdescribed">`getURIforItemDescribed`</a>
* <a href="#listassociations">`listAssociations`</a>

<!-- /div -->

<!-- div -->

## `Methods`
* <a href="#_unsafewritecallback-calbackerror">`_unsafeWrite`</a>
* <a href="#addassociationnamespaceattributeattributename-attributevalue-guid-uri">`addAssociationNamespaceAttribute`</a>
* <a href="#addfragmentnamespaceattributeattributename-uri">`addFragmentNamespaceAttribute`</a>
* <a href="#copyassociationguid-itemmirror-callback-callbackerror">`copyAssociation`</a>
* <a href="#createassociationoptions-callback-callbackerror-callbackguid">`createAssociation`</a>
* <a href="#createitemmirrorforassociatedgroupingitemguid">`createItemMirrorForAssociatedGroupingItem`</a>
* <a href="#deleteassociationguid-callback-callbackerror">`deleteAssociation`</a>
* <a href="#getassociationassociateditemguid">`getAssociationAssociatedItem`</a>
* <a href="#getassociationdisplaytextguid">`getAssociationDisplayText`</a>
* <a href="#getassociationlocalitemguid">`getAssociationLocalItem`</a>
* <a href="#getassociationnamespaceattributeattributename-guid-uri">`getAssociationNamespaceAttribute`</a>
* <a href="#getassociationnamespacedataguid-uri">`getAssociationNamespaceData`</a>
* <a href="#getfragmentnamespaceattributeattributename-uri">`getFragmentNamespaceAttribute`</a>
* <a href="#getfragmentnamespacedatauri">`getFragmentNamespaceData`</a>
* <a href="#hasassociationnamespaceguid-uri">`hasAssociationNamespace`</a>
* <a href="#hasfragmentnamespaceuri">`hasFragmentNamespace`</a>
* <a href="#isassociationassociateditemgroupingguid">`isAssociationAssociatedItemGrouping`</a>
* <a href="#isassociationphantomguid">`isAssociationPhantom`</a>
* <a href="#listassociationnamespaceattributesguid-uri">`listAssociationNamespaceAttributes`</a>
* <a href="#listfragmentnamespaceattributesuri">`listFragmentNamespaceAttributes`</a>
* <a href="#moveassociationguid-itemmirror-callback-callbackerror">`moveAssociation`</a>
* <a href="#refreshcallback-callbackerror">`refresh`</a>
* <a href="#removeassociationnamespaceattributeattributename-guid-uri">`removeAssociationNamespaceAttribute`</a>
* <a href="#removefragmentnamespaceattributeattributename-uri">`removeFragmentNamespaceAttribute`</a>
* <a href="#renameassociationlocalitemguid-string-callback-callbackerror-callbackguid">`renameAssociationLocalItem`</a>
* <a href="#savecallback-callbackerror">`save`</a>
* <a href="#setassociationdisplaytextguid-displaytext">`setAssociationDisplayText`</a>
* <a href="#setassociationnamespaceattributeattributename-attributevalue-guid-uri">`setAssociationNamespaceAttribute`</a>
* <a href="#setassociationnamespacedatadata-guid">`setAssociationNamespaceData`</a>
* <a href="#setdisplaynamename">`setDisplayName`</a>
* <a href="#setfragmentnamespaceattributeattributename-attributevalue-uri">`setFragmentNamespaceAttribute`</a>
* <a href="#setfragmentnamespacedatadata-uri">`setFragmentNamespaceData`</a>
* <a href="#upgradeassociationoptions-callback-callbackerror">`upgradeAssociation`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `Properties`

<!-- div -->

### <a id="getcreator"></a>`getCreator`
<a href="#getcreator">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L956 "View in source") [&#x24C9;][1]



* * *

<!-- /div -->

<!-- div -->

### <a id="getdisplayname"></a>`getDisplayName`
<a href="#getdisplayname">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L198 "View in source") [&#x24C9;][1]



* * *

<!-- /div -->

<!-- div -->

### <a id="getpublicurl"></a>`getPublicURL`
<a href="#getpublicurl">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L241 "View in source") [&#x24C9;][1]

Gets a URL for an association that can be shared. For instance, on a Google Drive document this provides a direct link to the document itself when opened.

* * *

<!-- /div -->

<!-- div -->

### <a id="getschemalocation"></a>`getSchemaLocation`
<a href="#getschemalocation">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L222 "View in source") [&#x24C9;][1]



* * *

<!-- /div -->

<!-- div -->

### <a id="getschemaversion"></a>`getSchemaVersion`
<a href="#getschemaversion">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L214 "View in source") [&#x24C9;][1]



* * *

<!-- /div -->

<!-- div -->

### <a id="geturiforitemdescribed"></a>`getURIforItemDescribed`
<a href="#geturiforitemdescribed">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L232 "View in source") [&#x24C9;][1]

Returns URI pointing to item described by the metadata of a fragment. A URI might point to just about anything that can be interpreted as a grouping item. For example: a conventional file system folder or a “tag as supported by any of several applications.

* * *

<!-- /div -->

<!-- div -->

### <a id="listassociations"></a>`listAssociations`
<a href="#listassociations">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L789 "View in source") [&#x24C9;][1]

Lists the GUIDs of each association.

* * *

<!-- /div -->

<!-- /div -->

<!-- div -->

## `Methods`

<!-- div -->

### <a id="_unsafewritecallback-calbackerror"></a>`_unsafeWrite(callback, calback.error)`
<a href="#_unsafewritecallback-calbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L762 "View in source") [&#x24C9;][1]

A special method that is used for certain file operations where calling a sync won't work. Essentially it is the save function,  sans syncing. This should __never__ be called be an application.

#### Arguments
1. `callback` *(Function)*:
2. `calback.error` *(Error)*:

* * *

<!-- /div -->

<!-- div -->

### <a id="addassociationnamespaceattributeattributename-attributevalue-guid-uri"></a>`addAssociationNamespaceAttribute(attributeName, attributeValue, GUID, uri)`
<a href="#addassociationnamespaceattributeattributename-attributevalue-guid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L833 "View in source") [&#x24C9;][1]

Adds the given attributeName to the association with the given GUID and namespaceURI.

#### Arguments
1. `attributeName` *(String)*: Name of the attribute.
2. `attributeValue` *(String)*: Value of the attribe to be set
3. `GUID` *(String)*: GUID of the association.
4. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="addfragmentnamespaceattributeattributename-uri"></a>`addFragmentNamespaceAttribute(attributeName, uri)`
<a href="#addfragmentnamespaceattributeattributename-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L317 "View in source") [&#x24C9;][1]

Adds the given attributeName to the fragment's current namespace

#### Arguments
1. `attributeName` *(string)*: Name of the attribute.
2. `uri` *(string)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="copyassociationguid-itemmirror-callback-callbackerror"></a>`copyAssociation(GUID, ItemMirror, callback, callback.error)`
<a href="#copyassociationguid-itemmirror-callback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L604 "View in source") [&#x24C9;][1]

Duplicates *(copies) an association to another ItemMirror Object (representing a grouping item)*

#### Arguments
1. `GUID` *(String)*: GUID of the association you wish to copy/duplicate
2. `ItemMirror` *(ItemMirror)*: ItemMirror representing the grouping item you want to move the GUID object to
3. `callback` *(Function)*: Function to execute once finished.
4. `callback.error` *(Object)*: Null if no error Null if no error has occurred in executing this function, else it contains an object with the error that occurred.

* * *

<!-- /div -->

<!-- div -->

### <a id="createassociationoptions-callback-callbackerror-callbackguid"></a>`createAssociation(options, callback, callback.error, callback.GUID)`
<a href="#createassociationoptions-callback-callbackerror-callbackguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L519 "View in source") [&#x24C9;][1]

Creates an association based on the given options and the following cases<br>
<br>
<br>
<br>
Cases `1`, `2`, `7` implemented. All else are not implemented.<br>
<br>
<br>
<br>
1. Simple text association declared phantom<br>
<br>
2. Link to existing non-grouping item, phantom. This can be a URL<br>
<br>
3. Link to existing non-grouping item, real<br>
<br>
4. Link to existing grouping item, phantom<br>
<br>
5. Link to existing grouping item, real<br>
<br>
6. Create new local non-grouping item<br>
<br>
7. Create new local grouping item

#### Arguments
1. `options` *(Object)*: Data to create an new association for.
2. `options.displayText` *(String)*: Display text for the association.<br>
<br> Required in all cases.
3. `options.itemURI` *(String)*: URI of the item. Required for case `2` & 3. Note: Please ensure "http://" prefix exists at the beginning of the string when referencing a Web URL and not an Item.
4. `options.localItemRequested` *(Boolean)*: True if the local item is requested, else false. Required for cases `2` & `3`.
5. `options.groupingItemURI` *(String)*: URI of the grouping item.<br>
<br> Required for cases `4` & `5`.
6. `options.xooMLDriverURI` *(String)*: URI of the XooML driver for the<br>
<br> association. Required for cases `4` & `5`.
7. `options.localItem` *(String)*: URI of the new local<br>
<br> non-grouping/grouping item. Required for cases `6` & `7`.
8. `options.isGroupingItem` *(String)*: True if the item is a grouping<br>
<br> item, else false. Required for cases `6` & `7`.
9. `callback` *(Function)*: Function to execute once finished.
10. `callback.error` *(Object)*: Null if no error has occurred in executing this function, else an contains an object with the error that occurred.
11. `callback.GUID` *(String)*: GUID of the association created.

* * *

<!-- /div -->

<!-- div -->

### <a id="createitemmirrorforassociatedgroupingitemguid"></a>`createItemMirrorForAssociatedGroupingItem(GUID)`
<a href="#createitemmirrorforassociatedgroupingitemguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L391 "View in source") [&#x24C9;][1]

Creates an ItemMirror from the associated grouping item represented by<br>
<br>
the given GUID.

#### Arguments
1. `GUID` *(String)*: GUID of the association to create the ItemMirror from

* * *

<!-- /div -->

<!-- div -->

### <a id="deleteassociationguid-callback-callbackerror"></a>`deleteAssociation(GUID, callback, callback.error)`
<a href="#deleteassociationguid-callback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L626 "View in source") [&#x24C9;][1]

Deletes the association represented by the given GUID

#### Arguments
1. `GUID` *(string)*: of the association to be deleted.
2. `callback` *(Function)*: Function to execute once finished.
3. `callback.error` *(Object)*: Null if no error has occurred in executing this function, else an contains an object with the error that occurred.

* * *

<!-- /div -->

<!-- div -->

### <a id="getassociationassociateditemguid"></a>`getAssociationAssociatedItem(GUID)`
<a href="#getassociationassociateditemguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L279 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(string)*: GUID of the association to get.

* * *

<!-- /div -->

<!-- div -->

### <a id="getassociationdisplaytextguid"></a>`getAssociationDisplayText(GUID)`
<a href="#getassociationdisplaytextguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L251 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(string)*: GUID representing the desired association.

* * *

<!-- /div -->

<!-- div -->

### <a id="getassociationlocalitemguid"></a>`getAssociationLocalItem(GUID)`
<a href="#getassociationlocalitemguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L270 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(string)*: GUID of the association to get.

* * *

<!-- /div -->

<!-- div -->

### <a id="getassociationnamespaceattributeattributename-guid-uri"></a>`getAssociationNamespaceAttribute(attributeName, GUID, uri)`
<a href="#getassociationnamespaceattributeattributename-guid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L800 "View in source") [&#x24C9;][1]



#### Arguments
1. `attributeName` *(String)*: Name of the attribute to be returned.
2. `GUID` *(String)*: GUID of the association to return attribute from.
3. `uri` *(String)*: Namspace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="getassociationnamespacedataguid-uri"></a>`getAssociationNamespaceData(GUID, uri)`
<a href="#getassociationnamespacedataguid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L888 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(String)*: GUID of the association namespace data to returned.
2. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="getfragmentnamespaceattributeattributename-uri"></a>`getFragmentNamespaceAttribute(attributeName, uri)`
<a href="#getfragmentnamespaceattributeattributename-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L289 "View in source") [&#x24C9;][1]



#### Arguments
1. `attributeName` *(string)*: Name of the attribute to be returned.
2. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="getfragmentnamespacedatauri"></a>`getFragmentNamespaceData(uri)`
<a href="#getfragmentnamespacedatauri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L367 "View in source") [&#x24C9;][1]



#### Arguments
1. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="hasassociationnamespaceguid-uri"></a>`hasAssociationNamespace(GUID, uri)`
<a href="#hasassociationnamespaceguid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L861 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(String)*: GUID of the association.
2. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="hasfragmentnamespaceuri"></a>`hasFragmentNamespace(uri)`
<a href="#hasfragmentnamespaceuri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L345 "View in source") [&#x24C9;][1]

Checks if the fragment has the given namespaceURI.

#### Arguments
1. `uri` *(String)*: URI of the namespace for the association.

* * *

<!-- /div -->

<!-- div -->

### <a id="isassociationassociateditemgroupingguid"></a>`isAssociationAssociatedItemGrouping(GUID)`
<a href="#isassociationassociateditemgroupingguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L780 "View in source") [&#x24C9;][1]

Checks if an association's associatedItem is a grouping item

#### Arguments
1. `GUID` *(String)*: of the association to be to be checked.

* * *

<!-- /div -->

<!-- div -->

### <a id="isassociationphantomguid"></a>`isAssociationPhantom(guid)`
<a href="#isassociationphantomguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L591 "View in source") [&#x24C9;][1]



#### Arguments
1. `guid` *(String)*:

* * *

<!-- /div -->

<!-- div -->

### <a id="listassociationnamespaceattributesguid-uri"></a>`listAssociationNamespaceAttributes(GUID, uri)`
<a href="#listassociationnamespaceattributesguid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L874 "View in source") [&#x24C9;][1]



#### Arguments
1. `GUID` *(String)*: GUID of association to list attributes for.
2. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="listfragmentnamespaceattributesuri"></a>`listFragmentNamespaceAttributes(uri)`
<a href="#listfragmentnamespaceattributesuri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L358 "View in source") [&#x24C9;][1]



#### Arguments
1. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="moveassociationguid-itemmirror-callback-callbackerror"></a>`moveAssociation(GUID, ItemMirror, callback, callback.error)`
<a href="#moveassociationguid-itemmirror-callback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L615 "View in source") [&#x24C9;][1]

Moves an association to another ItemMirror Object *(representing a grouping item)*

#### Arguments
1. `GUID` *(string)*: GUID of the item you want to paste or move
2. `ItemMirror` *(ItemMirror)*: ItemMirror representing the grouping item you want to move the GUID object to
3. `callback` *(Function)*: Function to execute once finished.
4. `callback.error` *(Object)*: Null if no error Null if no error has occurred in executing this function, else it contains an object with the error that occurred.

* * *

<!-- /div -->

<!-- div -->

### <a id="refreshcallback-callbackerror"></a>`refresh(callback, callback.error)`
<a href="#refreshcallback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L929 "View in source") [&#x24C9;][1]

Reloads the XooML Fragment

#### Arguments
1. `callback` *(Function)*: Function to execute once finished.
2. `callback.error` *(Object)*: Null if no error has occurred in executing this function, else an contains an object with the error that occurred.

* * *

<!-- /div -->

<!-- div -->

### <a id="removeassociationnamespaceattributeattributename-guid-uri"></a>`removeAssociationNamespaceAttribute(attributeName, GUID, uri)`
<a href="#removeassociationnamespaceattributeattributename-guid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L851 "View in source") [&#x24C9;][1]

Removes the given attributeName to the association with the given GUID and namespaceURI.

#### Arguments
1. `attributeName` *(String)*: Name of the attribute.
2. `GUID` *(String)*: GUID of the association.
3. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="removefragmentnamespaceattributeattributename-uri"></a>`removeFragmentNamespaceAttribute(attributeName, uri)`
<a href="#removefragmentnamespaceattributeattributename-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L334 "View in source") [&#x24C9;][1]

Removes the fragment namespace attribute with the given namespaceURI

#### Arguments
1. `attributeName` *(string)*: Name of the attribute.
2. `uri` *(string)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="renameassociationlocalitemguid-string-callback-callbackerror-callbackguid"></a>`renameAssociationLocalItem(GUID, String, callback, callback.error, callback.GUID)`
<a href="#renameassociationlocalitemguid-string-callback-callbackerror-callbackguid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L711 "View in source") [&#x24C9;][1]

Renames the local item for the association with the given GUID.

#### Arguments
1. `GUID` *(String)*: GUID of the association.
2. `String` *(String): String Name you want to rename the file to &#42;(including file extension)*&#42;
3. `callback` *(Function)*: Function to execute once finished.
4. `callback.error` *(Object)*: Null if no error has occurred in executing this function, else an contains an object with the error that occurred.
5. `callback.GUID` *(string)*: The GUID of the association that was updated.

* * *

<!-- /div -->

<!-- div -->

### <a id="savecallback-callbackerror"></a>`save(callback, callback.error)`
<a href="#savecallback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L966 "View in source") [&#x24C9;][1]

Saves the itemMirror object, writing it out to the fragment. Fails if the GUID generated on last write for the itemMirror and the XooML fragment don't match.

#### Arguments
1. `callback` *(Function)*:
2. `callback.error` *(Error)*: Returns false if everything went ok, otherwise returns the error

* * *

<!-- /div -->

<!-- div -->

### <a id="setassociationdisplaytextguid-displaytext"></a>`setAssociationDisplayText(GUID, displayText)`
<a href="#setassociationdisplaytextguid-displaytext">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L261 "View in source") [&#x24C9;][1]

Sets the display text for the association with the given GUID.

#### Arguments
1. `GUID` *(string)*: GUID of the association to set.
2. `displayText` *(string)*: Display text to be set.

* * *

<!-- /div -->

<!-- div -->

### <a id="setassociationnamespaceattributeattributename-attributevalue-guid-uri"></a>`setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, uri)`
<a href="#setassociationnamespaceattributeattributename-attributevalue-guid-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L817 "View in source") [&#x24C9;][1]

Sets the association namespace attribute with the given attributeName and the given namespaceURI within the association with the given GUID.

#### Arguments
1. `attributeName` *(String)*: Name of the attribute to be set.
2. `attributeValue` *(String)*: Value of the attribute to be set
3. `GUID` *(String)*: GUID of association to set attribute for.
4. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="setassociationnamespacedatadata-guid"></a>`setAssociationNamespaceData(data, GUID)`
<a href="#setassociationnamespacedatadata-guid">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L902 "View in source") [&#x24C9;][1]

Sets the association namespace data for an association with the given GUID and given namespaceURI using the given data.

#### Arguments
1. `data` *(String)*: Association namespace data to set. Must be valid fragmentNamespaceData.
2. `GUID` *(String)*: GUID of the association namespace data to set.

* * *

<!-- /div -->

<!-- div -->

### <a id="setdisplaynamename"></a>`setDisplayName(name)`
<a href="#setdisplaynamename">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L206 "View in source") [&#x24C9;][1]



#### Arguments
1. `name` *(string)*: The display text to set for the fragment

* * *

<!-- /div -->

<!-- div -->

### <a id="setfragmentnamespaceattributeattributename-attributevalue-uri"></a>`setFragmentNamespaceAttribute(attributeName, attributeValue, uri)`
<a href="#setfragmentnamespaceattributeattributename-attributevalue-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L304 "View in source") [&#x24C9;][1]

Sets the value of the given attributeName with the given attributeValue for the fragmentNamespaceData with the given namespaceURI.

#### Arguments
1. `attributeName` *(string)*: Name of the attribute to be set.
2. `attributeValue` *(string)*: Value of the attribute to be set.
3. `uri` *(string)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="setfragmentnamespacedatadata-uri"></a>`setFragmentNamespaceData(data, uri)`
<a href="#setfragmentnamespacedatadata-uri">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L377 "View in source") [&#x24C9;][1]

Sets the fragment namespace data with the given namespaceURI.

#### Arguments
1. `data` *(String)*: Fragment namespace data to be set.
2. `uri` *(String)*: Namespace URI

* * *

<!-- /div -->

<!-- div -->

### <a id="upgradeassociationoptions-callback-callbackerror"></a>`upgradeAssociation(options, callback, callback.error)`
<a href="#upgradeassociationoptions-callback-callbackerror">#</a> [&#x24C8;](https://github.com/KeepingFoundThingsFound/ItemMirror/blob/0.9.0/item-mirror.js#L696 "View in source") [&#x24C9;][1]

Upgrades a given association without a local item. Local item is named by a truncated form of the display name of this ItemMirror if the  localItemURI is not given, else uses given localItemURI. Always truncated to `50` characters.  __ONLY SUPPORTS SIMPLE PHANTOM ASSOCIATION TO ASSOCIATION WITH GROUPING ITEM__

#### Arguments
1. `options` *(Object)*: Data to construct a new ItemMirror with
2. `options.GUID` *(String)*: of the association to be upgraded. Required
3. `options.localItemURI` *(String)*: URI of the local item to be used if a truncated display name is not the intended behavior. Optional.
4. `callback` *(Function)*: Function to execute once finished.
5. `callback.error` *(String)*: Null if no error has occurred in executing this function, else an contains an object with the error that occurred.

* * *

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #properties "Jump back to the TOC."
