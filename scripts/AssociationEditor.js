/**
 * AssociationEditor is a minimal interface to represent a XooML2
 * association. This object is used together with FragmentEditor to
 * fully reprsent a XooML fragment as javascript object. It can be
 * converted seamlessly between an object and XML.
 *
 * Note that upon construction, this doesn't actually create an
 * association, merely a /representation/ of an association.
 *
 * There are two ways to construct an AssociationEditor:
 * 1. Through a valid Association XML Element
 * 2. By specifying all data through an object
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class AssociationEditor
 * @constructor
 *
 * @param {Object} options The options specified for the constructor
 *  @param {Element} options.element A DOM element that correctly
 *  represents an association as specified by the XooML schema.
 *  @param {Object} options.commonData An object that specifies the
 *  data for an association. Look at the private constructor
 *  `_fromOptions` for more details
 *
 * @protected
 */
define([
  "./XooMLExceptions",
  "./XooMLUtil"
], function(XooMLExceptions, XooMLUtil) {
  "use strict";

 var _ELEMENT_NAME = "association",
     _NAMESPACE_ELEMENT_NAME = "associationNamespaceElement",
     _ID_ATTR = "ID",
     _DISPLAY_TEXT_ATTR = "displayText",
     _ASSOCIATED_XOOML_FRAGMENT_ATTR = "associatedXooMLFragment",
     _ASSOCIATED_XOOML_DRIVER_ATTR = "associatedXooMLDriver",
     _ASSOCIATED_SYNC_DRIVER_ATTR = "associatedSyncDriver",
     _ASSOCIATED_ITEM_DRIVER_ATTR = "associatedItemDriver",
     _ASSOCIATED_ITEM_ATTR = "associatedItem",
     _LOCAL_ITEM_ATTR = "localItem",
     _IS_GROUPING_ATTR = "isGrouping";

  function AssociationEditor(options) {
    var self = this;

    if (options.element) {
      _fromElement(options.element, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, self);
    } else {
      console.log(XooMLExceptions.missingParameter);
    }
  }

  /**
   * Converts the object into an association element, which can then
   * be converted to a string or added to the DOM.
   *
   * @method toElement
   *
   * @returns {Element} A DOM element that can be further manipulated
   * with DOM methods
   *
   * @protected
   */
  AssociationEditor.prototype.toElement = function() {
    var self = this,
        // The We use a null namespace to leave it blank, otherwise it
        // sets it as XHTML and won't serialize attribute names properly.
        // The namespace will be inherited by the fragment it resides in.
        associationElem = document.createElementNS(null, _ELEMENT_NAME);

    // common data
    Object.keys(self.commonData).forEach( function(key) {
      if ( self.commonData[key] ) {// Don't set null attributes
        associationElem.setAttribute(key, self.commonData[key]);
      }
    });

    // namespace data
    Object.keys(self.namespace).forEach( function(uri) {
      var nsElem = document.createElementNS(uri, _NAMESPACE_ELEMENT_NAME);
      // Attributes
      Object.keys(self.namespace[uri].attributes).forEach( function(attrName) {
        nsElem.setAttributeNS(uri, attrName, self.namespace[ uri ].attributes[ attrName ]);
      });
      // Data
      nsElem.textContent = self.namespace[ uri ].data;

      associationElem.appendChild(nsElem);
    });

    return associationElem;
  };

  /**
   * Takes an association element in XML and then converts that into
   * an AssociationEditor object. Intended to be one of the ways the
   * object is constructed
   *
   * @method _fromElement
   *
   * @param {Element} element The XML element that represents an association.
   */
  function _fromElement(element, self) {
    var dataElems, i, uri, elem;
    // Sets all common data attributes
    self.commonData = {
      ID: element.getAttribute(_ID_ATTR),
      displayText: element.getAttribute(_DISPLAY_TEXT_ATTR),
      associatedXooMLFragment: element.getAttribute(_ASSOCIATED_XOOML_FRAGMENT_ATTR),
      associatedXooMLDriver: element.getAttribute(_ASSOCIATED_XOOML_DRIVER_ATTR),
      associatedSyncDriver: element.getAttribute(_ASSOCIATED_SYNC_DRIVER_ATTR),
      associatedItemDriver: element.getAttribute(_ASSOCIATED_ITEM_DRIVER_ATTR),
      associatedItem: element.getAttribute(_ASSOCIATED_ITEM_ATTR),
      localItem: element.getAttribute(_LOCAL_ITEM_ATTR),
      // We use JSON.parse to get the value as a boolean, not as a string
      isGrouping: JSON.parse(element.getAttribute(_IS_GROUPING_ATTR))
    };

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
            elem.getAttributeNS(uri, elem.attributes[i].localName );
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
  }

  /**
   * Constructs an association with data from an object
   * @method _fromOptions
   *
   * @param {Object} commonData Common data that is used by the
   * itemMirror library, and is app agnostic
   *  @param {String} commonData.displayText Display text for the
   *  association
   *  @param {String} commonData.associatedXooMLFragment URI of the
   *  associated XooML fragment for the association
   *  @param {String} commonData.associatedItem URI of the associated item
   *  @param {String} commonData.associatedXooMLDriver The associated
   *  XooML driver for the association
   *  @param {String} commonData.associatedItemDriver The associated
   *  item driver for the association
   *  @param {String} commonData.associatedSyncDriver The associated
   *  sync driver of the association
   *  @param {String} commonData.localItem The name/id of the
   *  association
   *  @param {Boolean} comnmonData.isGrouping Whether or not the
   *  association is a grouping item
   *  @param {String} commonData.readOnlyURLtoXooMLfragment Used in
   *  cases where the owner wishes for the XooML fragment representing
   *  an item to be public
   * @protected
   * @private
   */
  function _fromOptions(commonData, self) {
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
       * Text that describes the association
       * @property commonData.displayText
       * @type String
       */
      displayText: commonData.displayText || null,

      /**
       * The associated XooML fragment of the association
       * @property commonData.associatedXooMLFragment
       * @type String
       */
      associatedXooMLFragment: commonData.associatedXooMLFragment || null,

      /**
       * The associated XooML driver of the association
       * @property commonData.associatedXooMLDriver
       * @type String
       */
      associatedXooMLDriver: commonData.associatedXooMLDriver || null,

      /**
       * The associated sync driver of the association
       * @property commonData.associatedSyncDriver
       * @type String
       */
      associatedSyncDriver: commonData.associatedSyncDriver || null,

      /**
       * The associated item driver of the association
       * @property commonData.associatedItemDriver
       * @type String
       */
      associatedItemDriver: commonData.associatedItemDriver || null,

      /**
       * The associated item of the association
       * @property commonData.associatedItem
       * @type String
       */
      associatedItem: commonData.associatedItem || null,

      /**
       * The local item of the association
       * @property commonData.localItem
       * @type String
       */
      localItem: commonData.localItem || null,

      /**
       * Whether or not the item is a grouping item
       * @property commonData.isGrouping
       * @type Boolean
       */
      isGrouping: commonData.isGrouping || false,

      /**
       * The GUID of the association
       * @property commonData.ID
       * @type String
       */
      // GUID is generated upon construction
      ID: XooMLUtil.generateGUID()
    };

    /**
     * Data for the namespaces. Stored as a key pair value, with each
     * namespace referencing the namespace association element for the
     * corresponding namespace.
     *
     * @property namespace
     * @type Object
     */
    self.namespace = {};
    /**
     * The attributes of the current namespace, with each attribute
     * having a corresponding value.
     * @property namespace.URI.attributes
     * @type Object
     */

    /**
     * This is the namespace data stored within the namespace
     * element. Anything can be put here, and it will be stored as a
     * string. ItemMirror will not do anything with the data here and
     * doesn't interact with it at all. It is the responsibility of
     * other applications to properly store information here.
     *
     * @property namespace.URI.data
     * @type String
     */
  }

  return AssociationEditor;
});
