Getting Started
==========

##Dropbox

Sign up for a dropbox API key by going to dropbox.com and creating an app
https://www.dropbox.com/developers/apps
Create it for the Dropbox API, not the Datastore API.

In order to test and develop, you want to have a localhost environment where you can host your ItemMirror application at.

A couple popular solutions include
Python's http server which is built into python:
https://docs.python.org/3.3/library/http.server.html

Apache:
I like XAMPP which packages Apache with MySQL and PHP
https://www.apachefriends.org/download.html

Back at the dropbox App Console, allow multiple users and type in a redirect URI.
As of OAuth 2, valid redirect URI can either be an https TLS secured web server, or "http://localhost:xxxx/yourfolder/yourapp.html" for your local development environment
If you have Windows 8, you can set apache to listen to port 80 and use "http://localhost/yourfolder/yourapp.html". If you're using Vista or 7,
then you will have to pick a different port and replace xxxx to match. If you plan to use URL rewriting, different ports, or both a server and localhost, you can add multiple redirect URIs.

In our code, ItemMirror extends the unofficial dropbox javascript API
https://github.com/dropbox/dropbox-js

To load it via CDN, include in your .html file

` ` `
  <script src="//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js"></script>
` ` `

If you are a core developer and want to reference documentation for this api, go to:
http://coffeedoc.info/github/dropbox/dropbox-js/master/classes/Dropbox/Client.html

If you are indeed using dropbox, declare the following variables

` ` `
var   dropboxClient,
      dropboxAuthDriver,
      dropboxXooMLUtility,
      dropboxItemUtility,
` ` `

We'll be using the default Authentiction Driver: [Redirect](https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdriverredirect).
But others have been known to work, such as:
- [Popup](https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdriverpopup)
- [Chrome Extension](https://github.com/dropbox/dropbox-js/blob/stable/guides/builtin_drivers.md#dropboxauthdriverchromeextension)

` ` `
// Browser-side applications do not use the API secret.


dropboxAuthDriver = new Dropbox.Drivers.Redirect({
      rememberUser: true
});
dropboxClient = new Dropbox.Client({ key: "your-key-here" });
dropboxClient.authDriver(dropboxAuthDriver);
` ` ` 

You will then prime the Objects to initiate an ItemMirror that will work with dropbox

` ` `
    dropboxXooMLUtility = {
      driverURI: "DropboxXooMLUtility",
      dropboxClient: dropboxClient
    };
    dropboxItemUtility = {
      driverURI: "DropboxItemUtility",
      dropboxClient: dropboxClient
    };
    
` ` `

##ItemMirror

For Full Documentation, either Clone the Directory and access the webpage under Documentation, or access the github page: To be added

For a Demo, visit: https://github.com/KeepingFoundThingsFound/itemMirrorDemo-Explorirror
There are 3 branches. Master (Simple), Beta (Supports Files with public links), and Cut-and-Paste-Demo which supports Create, copying, and moving Phantom Associations.

We'll be constructing our first ItemMirror using Case 3: Check if an ItemMirror object already exists, and if not, create a new one.
The value "groupingItemURI" will be your starting point. "/" is the root of the User's Dropbox. If you wanted a ItemMirror confined to a Directory named FolderName, then use "FolderName" 

` ` `
    groupingItemURI = "/"
    itemMirrorOptions = {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        readIfExists: true
    };
` ` `

### Creating the "Root" ItemMirror Object (after Service-Client Authentication)

` ` `
    function run() {
      dropboxClient.authenticate(function (error, client) {
        if (error) {
          throw error;
        }
        constructNewItemMirror();
      });
    }
    
    function constructNewItemMirror(){
    new ItemMirror(itemMirrorOptions, function (error, itemMirror) {
        if (error) { throw error; }
        itemMirror.listAssociations(function (error, GUIDs){
            
            itemMirror.getAssociationDisplayText(GUIDs[i], function(error, text){
                //Do Stuff with it
            }
            createItemMirrorFromGroupingItem(itemMirror);
            //Create a new Item Mirror for each Associated Grouping Item
            itemMirror.createItemMirrorForAssociatedGroupingItem(
            GUID, function (error, newItemMirror) {
            if (error) { throw error; 
            //Do Stuff with your new ItemMirror
            itemMirror.getItemDescribed(function (error, itemDescribed) {
              if (error) { throw error; }
              alert("newItemMirror from Association displayText" + itemDescribed);
            });
          });
        }
      });
    }
` ` `

### Printing the Grouping and Non-Grouping Associations
Use jQuery to read and print data using ItemMirror Prototype functions such as:
- itemMirror.getDisplayText
- itemMirror.getAssociatedAssociation
- itemMirror.getLocalItem
- itemMirror.isAssociatedItemGrouping

### Adding and Deleting Associations

Create an object for the association you wish to create.
3 Cases are implemented, see documentation.

` ` `
    createAssociationOptions = {
      1: {
        displayText: "case1"
      },
      2: {
        displayText: "case2",
        itemURI: "http://case2"
      },
      7: {
        displayText: "case7",
        itemName: "case7",
        isGroupingItem: true
      }
    };
` ` `

Then pass it into the createAssociation Method

` ` `
    function createAssociation(itemMirror, options) {
      itemMirror.createAssociation(options, function (error, GUID) {
        if (error) {
          throw error;
        }

        //Do stuff with it
        
        getDisplayTextForAssociation(itemMirror, GUID);
        upgradeAssociation(itemMirror, GUID);
        deleteAssociation(itemMirror, GUID)
      });
    }
` ` `

Delete association also deletes physical files pertaining to an association.

Move, Copy, Cut, and Paste are now supported,

Clipboard Style
- cutAssociation
- copyAssociation
- pasteAssociation

Direct Move and Copy Style
- duplicateAssociation
- moveAssociation

see Documentation for further details