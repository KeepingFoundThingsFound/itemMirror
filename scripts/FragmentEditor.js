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
      _ITEM_MIRROR_NS = "http://kftf.ischool.washington.edu/xmlns/xooml";

  function FragmentEditor(options) {
    var self = this;

    if (options.text) {
      _fromString(options.text, self);
    } else if (options.element) {
      _fromElement(options.element, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, options.associations, self);
    } else {
      console.log(XooMLExceptions.missingParameter);
    }
  }

  /**
   * Updates the GUID of the Fragment
   *
   * @method updateID
   * @return {String} The new GUID of the fragment
   * @private
   * @protected
   */
  FragmentEditor.prototype.updateID = function() {
    var self = this, guid;

    guid = XooMLUtil.generateGUID();
    this.commonData.GUIDGeneratedOnLastWrite = guid;
    return guid;
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
        fragmentElem = document.createElementNS(_ITEM_MIRROR_NS, _ELEMENT_NAME);

    // common data
    Object.keys(self.commonData).forEach( function(attrName) {
      var attrValue = self.commonData[attrName];
      if (attrValue) { // Don't set null attributes
        fragmentElem.setAttribute(attrName, attrValue);
      }
    });

    // namespace data
    Object.keys(self.namespace).forEach( function(uri) {
      var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
      // Attributes
      Object.keys(self.namespace[uri].attributes).forEach( function(attrName) {
        nsElem.setAttributeNS(uri, attrName, self.namespace[ uri ].attributes[ attrName ]);
      });

      nsElem.textContent = self.namespace[ uri ].data;

      fragmentElem.appendChild(nsElem);
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
  function _fromOptions(commonData, associations, self) {
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
      displayName: commonData.displayName || null,

      /**
       * The schema location for the fragment
       * @property commonData.schemaLocation
       * @type String
       */
      schemaLocation: commonData.schemaLocation || null,

      /**
       * The schema version for the fragment
       * @property commonData.schemaVersion
       * @type String
       */
      schemaVersion: commonData.schemaVersion || null,

      /**
       * The item driver URI for the fragment
       * @property commonData.itemDriver
       * @type String
       */
      itemDriver: commonData.itemDriver || null,

      /**
       * The item described for the fragment. This is a URI that
       * points to grouping item from wich the itemMirror was created
       * @property commonData.
       * @type String
       */
      itemDescribed: commonData.itemDescribed || null,

      /**
       * The sync driver URI for the fragment
       * @property commonData.syncDriver
       * @type String
       */
      syncDriver: commonData.syncDriver || null,

      /**
       * The XooML driver URI for the fragment
       * @property commonData.xooMLDriver
       * @type String
       */
      xooMLDriver: commonData.xooMLDriver || null,

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
    self.namespace = {};
      /**
       * The namespace URI for the fragment. Used to set namespace data
       * for both the fragment and it's associations
       * @property namespace.uri
       * @type String
       */

      /**
       * The attributes of the namespace. This is app specific data
       * that is set for the fragment. Each key pair in the object
       * represents an attribute name and it's corresponding value
       * @property namespace.attributes
       * @type Object
       */
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
  }

  /**
   * Takes a fragment element in XML and then converts that into a
   * FragmentEditor object. Intended to be one of the ways the object
   * is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   * @param {FragmentEditor} self
   * @private
   */
  function _fromElement(element, self) {
    var dataElems, nsElem, i, associationElems, guid, elem, uri;
    // Sets all common data attributes
    self.commonData = {
      fragmentNamespaceElement: element.getAttribute(_NAMESPACE_ELEMENT_NAME),
      schemaVersion: element.getAttribute(_SCHEMA_VERSION_ATTR),
      schemaLocation: element.getAttribute(_SCHEMA_LOCATION_ATTR),
      itemDescribed: element.getAttribute(_ITEM_DESCRIBED_ATTR),
      displayName: element.getAttribute(_DISPLAY_NAME_ATTR),
      itemDriver: element.getAttribute(_ITEM_DRIVER_ATTR),
      syncDriver: element.getAttribute(_SYNC_DRIVER_ATTR),
      xooMLDriver: element.getAttribute(_XOOML_DRIVER_ATTR),
      GUIDGeneratedOnLastWrite: element.getAttribute(_GUID_ATTR)
    };

    /**
     * The namespace object is an associated array with each key being
     * a namespace URI. These can thene be used to modify fragment
     * namespace attributes and data
     * @property namespace
     * @type Object
     */
    self.namespace = {};

    dataElems = element.getElementsByTagName(_NAMESPACE_ELEMENT_NAME);
    for (i = 0; i < dataElems.length; i += 1) {
      elem = dataElems[i];
      uri = elem.namespaceURI;

      /**
       * The information for a given namespace. Includes both the
       * data, and the attributes. Namespaces URIs must be unique or
       * they will overwrite data from another namespace
       * @property namespace.URI
       * @type Object
       */
      self.namespace[ uri ] = {};
      self.namespace[ uri ].attributes = {};

      for (i = 0; i < elem.attributes.length; i += 1) {
        // We have to filter out the special namespace attribute We
        // let the namespace methods handle the namespace, and we
        // don't deal with it
        if (elem.attributes[i].name !== "xmlns") {
          /**
           * The attributes of the current namespace, with each attribute
           * having a corresponding value.
           * @property namespace.URI.attributes
           * @type Object
           */
          self.namespace[ uri ].attributes[ elem.attributes[i].localName ] =
            elem.getAttributeNS(uri, elem.attributes[i].localName);
        }
      }

    /**
     * This is the namespace data stored within the namespace
     * element. Anything can be put here, and it will be stored as a
     * string. ItemMirror will not do anything with the data here and
     * doesn't interact with it at all. It is the responsibility of
     * other applications to properly store information here.
     * @property namespace.URI.data
     * @type String
     */
      self.namespace[ uri ].data = elem.textContent;
    }

    // associations
    self.associations = {};
    associationElems = element.getElementsByTagName(_ASSOCIATION_ELEMENT_NAME);
    for (i = 0; i < associationElems.length; i += 1) {
      guid = associationElems[i].getAttribute(_ASSOCIATION_ID_ATTR);
      self.associations[guid] = new AssociationEditor({
        element: associationElems[i]
      });
    }
  }

  return FragmentEditor;
});
