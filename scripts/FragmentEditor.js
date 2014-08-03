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
      _COMMON_DATA_ATTRS = [_SCHEMA_LOCATION_ATTR,
                            _SCHEMA_VERSION_ATTR,
                            _ITEM_DESCRIBED_ATTR,
                            _DISPLAY_NAME_ATTR,
                            _ITEM_DRIVER_ATTR,
                            _SYNC_DRIVER_ATTR,
                            _XOOML_DRIVER_ATTR,
                            _GUID_ATTR];

  function FragmentEditor(options) {
    var self = this;

    if (options.text) {
      _fromString(options.text, options.namespace, self);
    } else if (options.element) {
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
   * Converts a FragmentEditor object into an XML element, which can
   * then be serialized and saved as a string, or further manipulated
   * with DOM methods
   * @method toElement
   * @return {Element} The XooML fragment as an XML element
   * @protected
   */
  FragmentEditor.prototype.toElement = function() {
    var self = this,
        fragmentElem = document.createElement(_ELEMENT_NAME),
        appNSElem;     // The namespace element specific for the app
    // common data
    Object.keys(self.commonData).forEach( function(key) {
      fragmentElem.setAttribute(key, self.commonData[key]);
    });

    // namespace data
    appNSElem = document.createElementNS(self.namespace.uri, _NAMESPACE_ELEMENT_NAME);
    Object.keys(self.namespace.attributes).forEach( function(key) {
      appNSElem.setAttributeNS(self.namespace.uri, key, self.namespace.attributes[key]);
    });

    fragmentElem.appendChild(appNSElem);

    appNSElem.innerHTML = self.namespace.data;
    self.namespace.otherNSElements.forEach( function(element) {
      fragmentElem.appendChild(element);
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
  function _fromOptions(commonData, associations, namespace, self) {
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
      displayName: commonData.displayName || "",

      /**
       * The schema location for the fragment
       * @property commonData.schemaLocation
       * @type String
       */
      schemaLocation: commonData.schemaLocation || "",

      /**
       * The schema version for the fragment
       * @property commonData.schemaVersion
       * @type String
       */
      schemaVersion: commonData.schemaVersion || "",

      /**
       * The item driver URI for the fragment
       * @property commonData.itemDriver
       * @type String
       */
      itemDriver: commonData.itemDriver || "",

      /**
       * The sync driver URI for the fragment
       * @property commonData.syncDriver
       * @type String
       */
      syncDriver: commonData.syncDriver || "",

      /**
       * The XooML driver URI for the fragment
       * @property commonData.xooMLDriver
       * @type String
       */
      xooMLDriver: commonData.xooMLDriver || "",

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
    self.namespace = {
      /**
       * The namespace URI for the fragment. Used to set namespace data
       * for both the fragment and it's associations
       * @property namespace.uri
       * @type String
       */
      uri: namespace || null,

      /**
       * The attributes of the namespace. This is app specific data
       * that is set for the fragment. Each key pair in the object
       * represents an attribute name and it's corresponding value
       * @property namespace.attributes
       * @type Object
       */
      attributes: {},

      /**
       * The data specific for an app. This is also app specific.
       * @property namespace.data
       * @type String
       */
      data: "",

      /**
       * The other namespace elements for the fragment
       * @property otherNSElements
       * @type Element[]
       */
      otherNSElements: []
    };
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
  };

  /**
   * Takes a fragment element in XML and then converts that into a
   * FragmentEditor object. Intended to be one of the ways the object
   * is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   * @param {String} namespace The namespace URI, used to load any app-specific data.
   * @param {FragmentEditor} self
   * @private
   */
  function _fromElement(element, namespace, self) {
    var dataElems, nsElem, i, associationElems, guid;
    // Sets all common data attributes
    self.commonData = {};
    _COMMON_DATA_ATTRS.forEach( function(attributeName) {
      self.commonData[attributeName] = element.getAttribute(attributeName);
    });

    self.namespace = {
      uri: namespace,
      data: "",
      attributes: {},
      otherNSElements: []
    };
    dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME);
    for (i = 0; i < dataElems.length; i += 1) {
      if (dataElems[i].namespaceURI === namespace) {
        nsElem = dataElems[i];
      } else {
        self.namespace.otherNSElements.push(dataElems[i]);
      }
    }

    // There may not BE any data for a namespace
    if (nsElem) {
      // Inner HTML is currently experimental, and isn't supported in
      self.namespace.data = nsElem.innerHTML;

      for (i = 0; i < nsElem.attributes.length; i += 1) {
        self.namespace.attributes[ nsElem.attributes[i].name ] =
          nsElem.getAttributeNS(namespace, nsElem.attributes[i].name);
      }
    }

    // associations
    self.associations = {};
    associationElems = element.getElementsByTagName(_ASSOCIATION_ELEMENT_NAME);
    for (i = 0; i < associationElems.length; i += 1) {
      guid = associationElems[i].getAttribute(_ASSOCIATION_ID_ATTR);
      self.associations[guid] = new AssociationEditor({
        element: associationElems[i],
        namespace: namespace
      });
    }
  }

  return FragmentEditor;
});
