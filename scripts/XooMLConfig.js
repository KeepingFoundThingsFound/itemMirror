/**
 * Configuration variables for XooML.js
 *
 * For ItemMirror core developers only. Enable protected to see.
 *
 * @class XooMLConfig
 * @static
 *
 * @protected
 */
define({
  // default schema version
  schemaVersion: "0.54",

  // default schema location
  schemaLocation: "http://kftf.ischool.washington.edu/xmlns/xooml",

  // XooMLFragment file name for XooML2.xmlns
  xooMLFragmentFileName: "XooML2.xml",

  // Maximum file length for upgradeAssociation localItemURI truncation
  maxFileLength: 50,

  // Case 1
  createAssociationSimple: {
    "displayText": true
  },

  // Case 2 and 3
  // localItemRequested exists:> case 3
  createAssociationLinkNonGrouping: {
    "displayText": true,        // String
    "itemURI": true,            // String
    "localItemRequested": false // String
  },

  // Case 4 and 5
  // localItemRequested:== true:> Case 5
  createAssociationLinkGrouping: { // Case 3
    "displayText": true,
    "groupingItemURI": true,
    "xooMLDriverURI": true
  },

  // Case 6 and 7
  createAssociationCreate: {
    "displayText": true,
    "itemName": true,
    "isGroupingItem": true
  }
});
