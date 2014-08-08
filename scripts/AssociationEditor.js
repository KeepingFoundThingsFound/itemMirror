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
 *  @param {String} options.namespace The namespace URI of the association
 *  <br/>
 *  __optional__
 *
 * @protected
 */
define([
  "./XooMLExceptions",
  "./XooMLUtil"
], function(
  XooMLExceptions,
  XooMLUtil) {
  "use strict";

 var _ELEMENT_NAME = "association",
     _NAMESPACE_ELEMENT_NAME = "associationNamespaceElement",
     _GUID_ATTR = "ID",
     _DISPLAY_TEXT_ATTR = "displayText",
     _ASSOCIATED_XOOML_FRAGMENT_ATTR = "associatedXooMLFragment",
     _ASSOCIATED_XOOML_DRIVER_ATTR = "associatedXooMLDriver",
     _ASSOCIATED_SYNC_DRIVER_ATTR = "associatedSyncDriver",
     _ASSOCIATED_ITEM_DRIVER_ATTR = "associatedItemDriver",
     _ASSOCIATED_ITEM_ATTR = "associatedItem",
     _LOCAL_ITEM_ATTR = "localItem",
     _IS_GROUPING_ATTR = "isGrouping",
     _COMMON_DATA_ATTRS = [_GUID_ATTR,
                           _DISPLAY_TEXT_ATTR,
                           _ASSOCIATED_XOOML_FRAGMENT_ATTR,
                           _ASSOCIATED_XOOML_DRIVER_ATTR,
                           _ASSOCIATED_SYNC_DRIVER_ATTR,
                           _ASSOCIATED_ITEM_DRIVER_ATTR,
                           _ASSOCIATED_ITEM_ATTR,
                           _LOCAL_ITEM_ATTR,
                          _IS_GROUPING_ATTR];

  function AssociationEditor(options) {
    var self = this;

    if (options.element) {
      _fromElement(options.element, options.namespace, self);
    } else if (options.commonData) {
      _fromOptions(options.commonData, options.namespace, self);
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
        associationElem = document.createElement(_ELEMENT_NAME),
        appNSElem;     // The namespace element specific for the app
    // common data
    Object.keys(self.commonData).forEach( function(key) {
      associationElem.setAttribute(key, self.commonData[key]);
    });

    // namespace data
    appNSElem = document.createElementNS(self.namespace.uri, _NAMESPACE_ELEMENT_NAME);
    Object.keys(self.namespace.attributes).forEach( function(key) {
      appNSElem.setAttributeNS(self.namespace.uri, key, self.namespace.attributes[key]);
    });

    associationElem.appendChild(appNSElem);

    appNSElem.innerHTML = self.namespace.data;
    self.namespace.otherNSElements.forEach( function(element) {
      associationElem.appendChild(element);
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
   * @param {String} namespace The namespace URI, used to load any app-specific data.
   */
  function _fromElement(element, namespace, self) {
    var dataElems, nsElem, i;
    // Sets all common data attributes
    self.commonData = {
      ID: element.getAttribute("id"),
      displayText: element.getAttribute("displaytext"),
      associatedXooMLFragment: element.getAttribute("associatedxoomlfragment"),
      associatedXooMLDriver: element.getAttribute("associatedxoomldriver"),
      associatedSyncDriver: element.getAttribute("associatedsyncdriver"),
      associatedItemDriver: element.getAttribute("associateditemdriver"),
      associatedItem: element.getAttribute("associateditem"),
      localItem: element.getAttribute("localitem"),
      isGrouping: element.getAttribute("isgrouping")
    };

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
   *
   * @param {String} namespace The namespace URI of the association <br/>
   * __optional__
   * @protected
   * @private
   */
  function _fromOptions(commonData, namespace, self) {
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
      displayText: commonData.displayText || "",

      /**
       * The associated XooML fragment of the association
       * @property commonData.associatedXooMLFragment
       * @type String
       */
      associatedXooMLFragment: commonData.associatedXooMLFragment || "",

      /**
       * The associated XooML driver of the association
       * @property commonData.associatedXooMLDriver
       * @type String
       */
      associatedXooMLDriver: commonData.associatedXooMLDriver || "",

      /**
       * The associated sync driver of the association
       * @property commonData.associatedSyncDriver
       * @type String
       */
      associatedSyncDriver: commonData.associatedSyncDriver || "",

      /**
       * The associated item driver of the association
       * @property commonData.associatedItemDriver
       * @type String
       */
      associatedItemDriver: commonData.associatedItemDriver || "",

      /**
       * The associated item of the association
       * @property commonData.associatedItem
       * @type String
       */
      associatedItem: commonData.associatedItemDriver || "",

      /**
       * The local item of the association
       * @property commonData.localItem
       * @type String
       */
      localItem: commonData.localItem || "",

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
     * Data for the _current_ namespace being accessed. The namespace
     * is specified during construction.
     * @property namespace
     * @type Object
     */
    self.namespace = {
      /**
       * The URI of the current namespace. Each app should use only
       * one namespace.
       * @property namespace.uri
       * @type String
       */
      uri: namespace,

      /**
       * The attributes of the current namespace, with each attribute
       * having a corresponding value.
       * @property namespace.attributes
       * @type Object
       */
      attributes: {},

      /**
       * The data for all of the other namespaces. These are DOM
       * elements, not strings, and only used for converting the
       * association back into an XML element
       * @property namespace.otherNSElements
       * @type Element[]
       */
      otherNSElements: [],

      /**
       * This is the namespace data stored within the namespace
       * element. Anything can be put here, and it will be stored as
       * HTML.
       * @property namespace.data
       * @type String
       */
      data: null
    };
  }

  return AssociationEditor;
});
