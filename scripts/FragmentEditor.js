/**
 * Constructs a FragmentWrapper for a XooML fragment. In the following cases.
 *
 * 1. XooMLFragment Element is passed in and is used as the XooMLFragment.
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
 *  @param {Element} options.element XML Element representing a XooML
 *                   fragment. Required for case 1.
 *  @param {AssociationEditor[]} options.associations List of associations for
 *          the newly constructed XooMLFragment in case 2. <br/>__optional__
 *  @param {Object} options.commonData Common data for the
 *  fragment. Look at the constructor for more details. Required for case 2
 *  @param {String} options.groupingItemURI The URI for the grouping
 *  item of the fragment. Required for case 2.
 *  @param {String} options.namespace The namespace URI. Used to
 *  access namespace specific data so apps can have their own set of
 *  data that they manipulate with worry of conflicts. <br/>
 *  __optional__
 *
 * @protected
 **/
define([
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

  var
    _NAMESPACE_ATTRIBUTE = "xmlns",
    _FRAGMENT = "fragment",
    _FRAGMENT_NAMESPACE_DATA = "fragmentNamespaceData",
    _FRAGMENT_SCHEMA_VERSION = "schemaVersion",
    _FRAGMENT_SCHEMA_LOCATION = "schemaLocation",
    _FRAGMENT_ITEM_DESCRIBED = "itemDescribed",
    _ITEM_DESCRIBED = ".",
    _FRAGMENT_ITEM_DRIVER = "itemDriver",
    _FRAGMENT_SYNC_DRIVER = "syncDriver",
    _FRAGMENT_XOOML_DRIVER = "xooMLDriver",
    _FRAGMENT_GUID = "GUIDGeneratedOnLastWrite",
    _ASSOCIATION = "association",
    _ASSOCIATION_NAMESPACE_DATA = "associationNamespaceData",
    _ASSOCIATION_GUID = "ID",
    _ASSOCIATION_DISPLAY_TEXT = "displayText",
    _ASSOCIATION_ASSOCIATED_XOOML_FRAGMENT = "associatedXooMLFragment",
    _ASSOCIATION_ASSOCIATED_XOOML_DRIVER = "associatedXooMLDriver",
    _ASSOCIATION_ASSOCIATED_ITEM = "associatedItem",
    _ASSOCIATION_LOCAL_ITEM = "localItem",
    _XML_XSI_URI = "http://www.w3.org/2001/XMLSchema-instance",

    _DEFAULT_VALUE_FOR_ADD_ATTRIBUTE = "",

    _CONSTRUCTOR_CASE_1_OPTIONS = {
      "xooMLFragmentString": true
    },
    _CONSTRUCTOR_CASE_2_OPTIONS = {
      "associations": true,
      "xooMLUtilityURI": true,
      "itemUtilityURI": true,
      "syncUtilityURI": true,
      "groupingItemURI": true
    },

    self;

  function FragmentEditor(options) {
    var self = this;

    if (options.element) {
      _fromElement(options.element, options.namespace, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, options.associations, options.namespace, self);
    } else {
      console.log(XooMLExceptions.missingParameter);
    }
  }

  /**
   * Updates the GUID of the Fragment
   *
   * @method updateETag
   * @return {String} The new GUID of the fragment
   * @private updateETag
   *
   * @protected
   */
  FragmentEditor.prototype.updateID = function() {
    var self = this, guid;

    guid = XooMLUtil.generateGUID();
    this.commonData.ID = guid;
    return guid;
  };

  /**
   * Creates an association based on the given options and the following
   * cases.
   *
   * Case 1: Simple text association declared phantom. <br/>
   * Case 2: Link to existing non-grouping item, phantom. <br/>
   * Case 3: Link to existing non-grouping item, real. <br/>
   * Case 4: Link to existing grouping item, phantom. <br/>
   * Case 5: Link to existing grouping item, real. <br/>
   * Case 6: Create new local non-grouping item. <br/>
   * Case 7: Create new local grouping item. <br/>
   *
   * Throws NullArgumentException when options, callback is null. <br/>
   * Throws InvalidTypeException when options is not an object and callback
   * is not a function. <br/>
   * Throws MissingParameterException when an argument is missing for an expected
   * case. <br/>
   *
   * @method createAssociation
   *
   * @param {Object} options Data to create an new association for.
   *
   *  @param {String}  options.displayText. Display text for the association.
   *                   Required in all cases.
   *
   *  @param {String}  options.itemOrXooMLFragmentURI URI of the item or
   *                   XooMLFragment depending on the case. Required for
   *                   cases 2, 3, 4 & 5.
   *
   *  @param {Boolean} options.localItemRequested True if the local item is
   *                   requested, else false. Required for cases 2, 3, 4, & 5.
   *
   *  @param {String}  options.xooMLDriverURI URI of the XooML driver for the
   *                   association. Required for cases 4 & 5.
   *
   *  @param {String}  options.itemName Name of the new local
   *                   non-grouping/grouping item. Required for cases 6 & 7.
   *
   *  @param {String}  options.itemType Type of the new local
   *                   non-grouping/grouping item. Required for case 6.
   *
   * @return {String} GUID of the newly created association.
   *
   * @protected
   */
  FragmentEditor.prototype.createAssociation = function (options) {
    if (!options) {
      return XooMLExceptions.nullArgument;
    }
    if (!XooMLUtil.isObject(options)) {
      return XooMLExceptions.invalidType;
    }
    var self = this, GUID, isLinkNonGrouping, isSimple, isLinkGrouping, isCreate;

    self._updateFragment(self._document);
    GUID = XooMLUtil.generateGUID();
    isSimple = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationSimple, options);
    isLinkNonGrouping = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationLinkNonGrouping, options);
    isLinkGrouping = XooMLUtil.hasOptions(XooMLConfig
      .createAssociationLinkGrouping, options);
    isCreate = XooMLUtil.hasOptions(XooMLConfig.
      createAssociationCreate, options);

    if (isSimple) {
      return self._createAssociation(GUID, null, options.displayText, null, null, null);
    } else if (isLinkNonGrouping) {
      return self._createAssociationLinkNonGrouping(GUID, options);
    } else if (isLinkGrouping) {
      return self._createAssociationLinkGrouping(GUID, options);
    } else if (isCreate) {
      return self._createAssociationCreate(GUID, options);
    } else {
      return XooMLExceptions.missingParameter;
    }
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
   * @protected
   */
  FragmentEditor.prototype.deleteAssociation = function (GUID) {
    if (!GUID) {
      return XooMLExceptions.nullArgument;
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return XooMLExceptions.invalidType;
    }
    var self = this, association, associations, i;

    associations =  self._document.getElementsByTagName(_ASSOCIATION);
    for (i = 0; i < associations.length; i += 1) {
      association = associations[i];
      if (association.getAttribute(_ASSOCIATION_GUID) === GUID) {
        association.parentNode.removeChild(association);
      }
    }

    //"Association with given GUID does not exist."
    return XooMLExceptions.invalidArgument;
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
   *  @param {String} commonData.displayName Display name of an association
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
  function _fromOptions(commonData, associations, namespace, self) {

  };

  /**
   * Takes an association element in XML and then converts that into
   * an AssociationEditor object. Intended to be one of the ways the
   * object is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   * @param {String} namespace The namespace URI, used to load any app-specific data.
   * @param {FragmentEditor} self
   * @private
   */
  function _fromElement(element, namespace, self) {

  };

  return FragmentEditor;
});