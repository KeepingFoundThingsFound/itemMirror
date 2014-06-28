/**
 * Collection of exceptions associated with the XooML tools.
 *
 * @class XooMLExceptions
 * @static
 *
 * @protected
 */
define(function() {
  "use strict";

  return {
    /**
     * Thrown when a method is not yet implemented.
     *
     * @event NotImplementedException
     */
    notImplemented: "NotImplementedException",

    /**
     * Thrown when a required property from a method's options is missing.
     *
     * @event MissingParameterException
     */
    missingParameter: "MissingParameterException",

    /**
     * Thrown when an argument is given a null value when it does not accept null
     * values.
     *
     * @event NullArgumentException
     */
    nullArgument: "NullArgumentException",

    /**
     * Thrown when an argument is given a value with a different type from the
     * expected type.
     *
     * @event InvalidTypeException
     */
    invalidType: "InvalidTypeException",

    /**
     * Thrown when an a method is called when the object is in invalid state
     * given what the method expected.
     *
     * @event InvalidStateArgument
     */
    invalidState: "InvalidStateArgument",

    /**
     * Thrown after receiving an exception from XooMLU Storage
     *
     * @event XooMLUException
     */
    xooMLUException: "XooMLUException",

    /**
     * Thrown after receiving an exception from ItemU Storage
     *
     * @event ItemUException
     */
    itemUException: "ItemUException",

    /**
     * Thrown after an association was upgraded that could not be upgraded.
     *
     * @event NonUpgradeableAssociationException
     */
    nonUpgradeableAssociationException: "NonUpgradeableAssociationException",

    /**
     * Thrown after an argument was passed in an invalid state than expected.
     *
     * @event InvalidArgumentException
     */
    invalidArgument: "InvalidOptionsException",

    /**
     * Thrown after expecting a file or folder not to exist when it does.
     *
     * @event FileOrFolderAlreadyExistsException
     */
    itemAlreadyExists: "ItemAlreadyExistsException",

    /**
     * Thrown when expecting the ItemMirror to be current, and it is not.
     *
     * @event FileOrFolderAlreadyExistsException
     */
    itemMirrorNotCurrent: "ItemMirrorNotCurrent"
  };
});
