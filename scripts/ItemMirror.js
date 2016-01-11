/**
 * ItemMirror represents an Item according to the XooML2 specification.
 *
 * It can be instantiated using one of the following two cases based on the
 * given arguments.
 *
 * 1. XooMLFragment already exists. Given xooMLFragmentURI and xooMLDriver.
 * 2. The XooMLFragment is created from an existing groupingItemURI (e.g., a dropbox folder).
 * Given a groupingItemURI, itemDriver, and a xooMLDriver a new itemMirror will be constructed for given groupingItemURI.
 *
 * Throws NullArgumentException when options is null.
 *
 * Throws MissingParameterException when options is not null and a required
 * argument is missing.
 *
 * @class ItemMirror
 * @constructor
 *
 * @param {Object} options Data to construct a new ItemMirror with
 *
 *  @param {String} options.groupingItemURI URI to the grouping item. Required
 *                  for all cases.
 *
 *  @param {String} options.itemDriver Data for the ItemDriver to
 *                  construct ItemMirror with. Required for cases 2 & 3
 *                  Can contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.itemDriver.driverURI URI of the driver.
 *
 *  @param {String} options.xooMLDriver Data for the XooMLDriver to
 *                  construct ItemMirror with. Required for all cases.
 *                  Can contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.xooMLDriver.driverURI URI of the driver.
 *
 *  @param {String} options.syncDriver Data for the SyncDriver to
 *                  construct ItemMirror with. Required Case 2 & 3. Can
 *                  contain any amount of optional key/value pairs for
 *                  the various Driver implementations.
 *   @param {String} options.syncDriver.driverURI URI of the driver.
 *
 *  @param {Boolean} options.readIfExists True if ItemMirror
 *                   should create an ItemMirror if it does not exist,
 *                   else false. Required for Case 2 & 3.
 *
 *  @param {ItemMirror} options.creator If being created from another
 *  itemMirror, specifies that itemMirror which it comes from.
 *
 * @param {Function} callback Function to execute once finished.
 *  @param {Object}   callback.error Null if no error has occurred
 *                    in executing this function, else an contains
 *                    an object with the error that occurred.
 *  @param {ItemMirror} callback.itemMirror Newly constructed ItemMirror
 */

'use strict'

window.dropboxItemMirror = function t(e,o,n){function i(a,s){if(!o[a]){if(!e[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(r)return r(a,!0);var m=new Error("Cannot find module '"+a+"'");throw m.code="MODULE_NOT_FOUND",m}var u=o[a]={exports:{}};e[a][0].call(u.exports,function(t){var o=e[a][1][t];return i(o?o:t)},u,u.exports,t,e,o,n)}return o[a].exports}for(var r="function"==typeof require&&require,a=0;a<n.length;a++)i(n[a]);return i}({1:[function(t,e,o){"use strict";function n(t){var e=this;if(t.element)i(t.element,e);else{if(!t.commonData)throw new Error(a.missingParameter);r(t.commonData,e)}}function i(t,e){var o,n,i,r;for(e.commonData={ID:t.getAttribute(u),displayText:t.getAttribute(p),associatedXooMLFragment:t.getAttribute(l),associatedXooMLDriver:t.getAttribute(f),associatedSyncDriver:t.getAttribute(g),associatedItemDriver:t.getAttribute(d),associatedItem:t.getAttribute(h),localItem:t.getAttribute(v),isGrouping:JSON.parse(t.getAttribute(y))},e.namespace={},o=t.getElementsByTagName(m),n=0;n<o.length;n+=1){for(r=o[n],i=r.namespaceURI,e.namespace[i]={},e.namespace[i].attributes={},n=0;n<r.attributes.length;n+=1)"xmlns"!==r.attributes[n].name&&(e.namespace[i].attributes[r.attributes[n].localName]=r.getAttributeNS(i,r.attributes[n].localName));e.namespace[i].data=r.textContent}}function r(t,e){if(!t)throw a.nullArgument;e.commonData={displayText:t.displayText||null,associatedXooMLFragment:t.associatedXooMLFragment||null,associatedXooMLDriver:t.associatedXooMLDriver||null,associatedSyncDriver:t.associatedSyncDriver||null,associatedItemDriver:t.associatedItemDriver||null,associatedItem:t.associatedItem||null,localItem:t.localItem||null,isGrouping:t.isGrouping||!1,ID:s.generateGUID()},e.namespace={}}var a=t("./XooMLExceptions"),s=t("./XooMLUtil"),c="association",m="associationNamespaceElement",u="ID",p="displayText",l="associatedXooMLFragment",f="associatedXooMLDriver",g="associatedSyncDriver",d="associatedItemDriver",h="associatedItem",v="localItem",y="isGrouping";n.prototype.toElement=function(){var t=this,e=document.createElementNS(null,c);return Object.keys(t.commonData).forEach(function(o){t.commonData[o]&&e.setAttribute(o,t.commonData[o])}),Object.keys(t.namespace).forEach(function(o){var n=document.createElementNS(o,m);Object.keys(t.namespace[o].attributes).forEach(function(e){n.setAttributeNS(o,e,t.namespace[o].attributes[e])}),n.textContent=t.namespace[o].data,e.appendChild(n)}),e},e.exports=n},{"./XooMLExceptions":8,"./XooMLUtil":9}],2:[function(t,e,o){"use strict";function n(t){var e=this;if(t.text)r(t.text,e);else if(t.element)a(t.element,e);else{if(!t.commonData)throw new Error(s.missingParameter);i(t.commonData,t.associations,e)}}function i(t,e,o){if(!t)throw s.nullArgument;o.commonData={displayName:t.displayName||null,schemaLocation:t.schemaLocation||null,schemaVersion:t.schemaVersion||null,itemDriver:t.itemDriver||null,itemDescribed:t.itemDescribed||null,syncDriver:t.syncDriver||null,xooMLDriver:t.xooMLDriver||null,GUIDGeneratedOnLastWrite:c.generateGUID()},o.associations={},e.forEach(function(t){var e=t.commonData.ID;o.associations[e]=t}),o.namespace={}}function r(t,e,o){var n=new DOMParser,i=n.parseFromString(t,"application/xml");a(i.children[0],e,o)}function a(t,e){var o,n,i,r,a,s;for(e.commonData={fragmentNamespaceElement:t.getAttribute(f),schemaVersion:t.getAttribute(g),schemaLocation:t.getAttribute(d),itemDescribed:t.getAttribute(h),displayName:t.getAttribute(v),itemDriver:t.getAttribute(y),syncDriver:t.getAttribute(D),xooMLDriver:t.getAttribute(I),GUIDGeneratedOnLastWrite:t.getAttribute(_)},e.namespace={},o=t.getElementsByTagName(f),n=0;n<o.length;n+=1){for(a=o[n],s=a.namespaceURI,e.namespace[s]={},e.namespace[s].attributes={},n=0;n<a.attributes.length;n+=1)"xmlns"!==a.attributes[n].name&&(e.namespace[s].attributes[a.attributes[n].localName]=a.getAttributeNS(s,a.attributes[n].localName));e.namespace[s].data=a.textContent}for(e.associations={},i=t.getElementsByTagName(p),n=0;n<i.length;n+=1)r=i[n].getAttribute(l),e.associations[r]=new m({element:i[n]})}var s=t("./XooMLExceptions"),c=t("./XooMLUtil"),m=t("./AssociationEditor"),u="fragment",p="association",l="ID",f="fragmentNamespaceElement",g="schemaVersion",d="schemaLocation",h="itemDescribed",v="displayName",y="itemDriver",D="syncDriver",I="xooMLDriver",_="GUIDGeneratedOnLastWrite",x="http://kftf.ischool.washington.edu/xmlns/xooml";n.prototype.updateID=function(){var t=c.generateGUID();return this.commonData.GUIDGeneratedOnLastWrite=t,t},n.prototype.toElement=function(){var t=this,e=document.createElementNS(x,u);return Object.keys(t.commonData).forEach(function(o){var n=t.commonData[o];n&&e.setAttribute(o,n)}),Object.keys(t.namespace).forEach(function(o){var n=document.createElementNS(o,f);Object.keys(t.namespace[o].attributes).forEach(function(e){n.setAttributeNS(o,e,t.namespace[o].attributes[e])}),n.textContent=t.namespace[o].data,e.appendChild(n)}),Object.keys(t.associations).forEach(function(o){e.appendChild(t.associations[o].toElement())}),e},n.prototype.toString=function(){var t=new XMLSerializer;return t.serializeToString(this.toElement())},e.exports=n},{"./AssociationEditor":1,"./XooMLExceptions":8,"./XooMLUtil":9}],3:[function(t,e,o){"use strict";function n(t,e){var o=this;if(!t.clientInterface)throw new Error("Client parameter missing");this.clientInterface=t.clientInterface;var n=this.clientInterface.auth2.getAuthInstance().currentUser.get().getAuthResponse();return this._AUTH_HEADER={Authorization:"Bearer "+n.access_token},this._DRIVE_FILE_API="https://www.googleapis.com/drive/v2/files/",o._FOLDER_MIMETYPE="application/vnd.google-apps.folder",e(!1,o)}var i=t("./XooMLConfig"),r=t("./AssociationEditor");n.prototype.isGroupingItem=function(t,e){var o=this;$.get({url:o._DRIVE_FILE_API+t,headers:o._AUTH_HEADER}).then(function(t){e(!1,o._FOLDER_MIMETYPE===t.mimeType)}).fail(function(){e("No response from GET: "+t)})},n.prototype.createGroupingItem=function(t,e,o){var n=this;$.post({url:n._DRIVE_FILE_API,headers:n._AUTH_HEADER,body:{mimeType:n._FOLDER_MIMETYPE,title:e,parents:[t]}}).then(function(t){o(!1,t.id)}).fail(function(){o("Failed to make POST request for new grouping item. Check network requests for more deatils")})},n.prototype.createNonGroupingItem=function(t,e,o){var n=this;n._dropboxClient.writeFile(t,e,function(t,e){return t?n._showDropboxError(t,o):o(!1,e)})},n.prototype.deleteGroupingItem=function(t,e){var o=this;o._dropboxClient.remove(t,function(t,n){return t?o._showDropboxError(t,e):e(!1,n)})},n.prototype.deleteNonGroupingItem=function(t,e){var o=this;o._dropboxClient.remove(t,function(t,n){return t?o._showDropboxError(t,e):e(!1,n)})},self.copyItem=function(t,e,o){var n=this;n._dropboxClient.copy(t,e,function(t){return t?n._showDropboxError(t,o):o(!1)})},n.prototype.moveItem=function(t,e,o){var n=this;n._dropboxClient.move(t,e,function(t){return t?n._showDropboxError(t,o):o(!1)})},n.prototype.getURL=function(t,e){var o=this;o._dropboxClient.makeUrl(t,null,function(t,n){return t?o._showDropboxError(t,e):e(!1,n.url)})},n.prototype.listItems=function(t,e){var o=this,n="'"+t+"' in parents",a=this.clientInterface.client.drive.files.list({maxResults:1e3,q:n});a.execute(function(t){if(t.error)return e("Error: Bad Response / Request");var n=t.items.filter(function(t){return t.title!==i.xooMLFragmentFileName}).map(function(t){return new r({commonData:{associatedXooMLFragment:null,associatedItem:t.id,associatedItemDriver:"GoogleItemDriver",associatedXooMLDriver:"GoogleXooMLDriver",associatedSyncDriver:"MirrorSyncDriver",isGrouping:t.mimeType===o._FOLDER_MIMETYPE,localItem:t.id,displayText:t.title}})});e(!1,n)})},n.prototype.checkExisted=function(t,e){var o,n=this;n._dropboxClient.stat(t,function(t,i){return t?n._showDropboxError(t,e):(o=!(null!==t&&404===t.status)||null===t&&i.isRemoved,e(!1,o))})},e.exports=n},{"./AssociationEditor":1,"./XooMLConfig":6}],4:[function(t,e,o){"use strict";function n(t,e){function o(t,o){return t?e(t):(d._xooMLDriver=o,void d._xooMLDriver.getXooMLFragment(n))}function n(o,n){if("XooML Not Found"===o)new s(t.itemDriver,p);else{if(o)return e(o);u(n)}}function u(o){d._fragment=new m({text:o}),new s(t.itemDriver,function(t,o){return t?e(t):(d._itemDriver=o,d._syncDriver=new c(d),void d.refresh(function(){return e(!1,d)}))})}function p(t,e){d._itemDriver=e,d._itemDriver.listItems(d._groupingItemURI,l)}function l(t,o){return t?e(t):(d._fragment=new m({commonData:{itemDescribed:d._groupingItemURI,displayName:g,itemDriver:"dropboxItemDriver",xooMLDriver:"dropboxXooMLDriver",syncDriver:"itemMirrorSyncUtility"},associations:o}),d._syncDriver=new c(d),d._xooMLDriver.setXooMLFragment(d._fragment.toString(),function(t){if(t)throw new Error(t)}),e(!1,d))}if(r.checkCallback(e),!t)return e(i.nullArgument);if(!r.isObject(t))return e(i.invalidType);var f,g,d=this;this._xooMLDriverClient=t.xooMLDriver.clientInterface,this._itemDriverClient=t.xooMLDriver.clientInterface,d._xooMLDriver=null,d._itemDriver=null,d._syncDriver=null,d._creator=t.creator||null,d._groupingItemURI=t.groupingItemURI,d._newItemMirrorOptions=t,g="TBD",d.fragmentURI=t.fragmentURI||null,t.xooMLDriver.fragmentURI=f,new a(t.xooMLDriver,o)}var i=t("./XooMLExceptions"),r=t("./XooMLUtil"),a=t("./XooMLDriver"),s=t("./ItemDriver"),c=t("./SyncDriver"),m=t("./FragmentEditor"),u=t("./AssociationEditor");n.prototype.getDisplayName=function(){return this._fragment.commonData.displayName},n.prototype.setDisplayName=function(t){this._fragment.commonData.displayName=t},n.prototype.getSchemaVersion=function(){return this._fragment.commonData.schemaVersion},n.prototype.getSchemaLocation=function(){return this._fragment.commonData.schemaLocation},n.prototype.getURIforItemDescribed=function(){return this._fragment.commonData.itemDescribed},n.prototype.getAssociationDisplayText=function(t){return this._fragment.associations[t].commonData.displayText},n.prototype.setAssociationDisplayText=function(t,e){this._fragment.associations[t].commonData.displayText=e},n.prototype.getAssociationLocalItem=function(t){return this._fragment.associations[t].commonData.localItem},n.prototype.getAssociationAssociatedItem=function(t){return this._fragment.associations[t].commonData.associatedItem},n.prototype.getFragmentNamespaceAttribute=function(t,e){var o=this._fragment.namespace;return o[e]=o[e]||{},o[e].attributes=o[e].attributes||{},this._fragment.namespace[e].attributes[t]},n.prototype.setFragmentNamespaceAttribute=function(t,e,o){var n=this._fragment.namespace;n[o]=n[o]||{},n[o].attributes=n[o].attributes||{},this._fragment.namespace[o].attributes[t]=e},n.prototype.addFragmentNamespaceAttribute=function(t,e){var o=this._fragment.namespace;if(o[e]=o[e]||{},o[e].attributes=o[e].attributes||{},this._fragment.namespace[e].attributes[t])throw i.invalidState;this.setFragmentNamespaceAttribute(t,e)},n.prototype.removeFragmentNamespaceAttribute=function(t,e){delete this._fragment.namespace[e].attributes[t]},n.prototype.hasFragmentNamespace=function(t){var e=this._fragment.namespace[t];return e?!0:!1},n.prototype.listFragmentNamespaceAttributes=function(t){return Object.keys(this._fragment.namespace[t].attributes)},n.prototype.getFragmentNamespaceData=function(t){return this._fragment.namespace[t].data},n.prototype.setFragmentNamespaceData=function(t,e){var o=this._fragment.namespace;o[e]=o[e]||{},this._fragment.namespace[e].data=t},n.prototype.createItemMirrorForAssociatedGroupingItem=function(t,e){var o,i,r,a,s,c=this;return r={driverURI:"GoogleItemUtility",clientInterface:this._itemDriverClient,associatedItem:c.getAssociationAssociatedItem(t)},i={fragmentURI:s,driverURI:"GoogleXooMLUtility",clientInterface:this._xooMLDriverClient,associatedItem:c.getAssociationAssociatedItem(t)},a={utilityURI:"SyncUtility"},(o=c.isAssociationAssociatedItemGrouping(t))?void new n({groupingItemURI:c.getAssociationAssociatedItem(t),xooMLDriver:i,itemDriver:r,syncDriver:a,creator:c},function(t,o){return e(t,o)}):e("Association not grouping, cannot continue")},n.prototype.createAssociation=function(t,e){var o,n,a=this;if(n=function(t){var o=t.commonData.ID;a._fragment.associations[o]=t,a.save(function(t){return e(t,o)})},!r.isFunction(e))throw i.invalidType;return r.isObject(t)?t.displayText&&t.localItem&&t.isGroupingItem?(o=new u({commonData:{displayText:t.displayText,isGrouping:!0,localItem:t.localItem,associatedItem:t.associatedItem}}),void a._itemDriver.createGroupingItem(t.displayText,function(t){return t?e(t):n(o)})):(t.displayText&&t.itemURI?o=new u({commonData:{displayText:t.displayText,associatedItem:t.itemURI,isGrouping:!1}}):t.displayText&&(o=new u({commonData:{displayText:t.displayText,isGrouping:!1}})),n(o)):e(i.invalidType)},n.prototype.isAssociationPhantom=function(t){var e=this._fragment.associations[t].commonData;return!(e.isGrouping||e.localItem)},n.prototype.copyAssociation=function(){throw new Error("Method not implemented")},n.prototype.moveAssociation=function(){throw new Error("Method not implemented")},n.prototype.deleteAssociation=function(t,e){function o(o){if(o)return e(o);var i=a.isAssociationPhantom(t);if(i)return delete a._fragment.associations[t],a._unsafeWrite(function(t){return t?e(t):e()});var r=a.isAssociationAssociatedItemGrouping(t),s=a.getAssociationAssociatedItem(t);return delete a._fragment.associations[t],r?a._itemDriver.deleteGroupingItem(s,n):a._itemDriver.deleteNonGroupingItem(s,n)}function n(t){return t?e(t):a.refresh(function(t){return e(t?t:t)})}var a=this;return r.checkCallback(e),t?r.isGUID(t)?a.save(o):e(i.invalidType):e(i.nullArgument)},n.prototype.upgradeAssociation=function(){throw new Error("Method not implemented")},n.prototype.renameAssociationLocalItem=function(t,e,o){function n(t){return t?o(t):void m._itemDriver.rename(e,a)}function a(n){return n?o(n):(m._fragment.associations[t].commonData.localItem=e,void m._unsafeWrite(s))}function s(t){return t?o(t):void m.refresh(c)}function c(e){return o(e,m._fragment.associations[t].commonData.ID)}var m=this;return r.checkCallback(o),t?r.isGUID(t)?void m.save(n):o(i.invalidType):o(i.nullArgument)},n.prototype._unsafeWrite=function(t){var e=this;return e._fragment.updateID(),e._xooMLDriver.setXooMLFragment(e._fragment.toString(),function(e){return t(e?e:!1)})},n.prototype.isAssociationAssociatedItemGrouping=function(t){return this._fragment.associations[t].commonData.isGrouping},n.prototype.listAssociations=function(){return Object.keys(this._fragment.associations)},n.prototype.getAssociationNamespaceAttribute=function(t,e,o){var n=this._fragment.associations[e].namespace;return n[o]=n[o]||{},n[o].attributes=n[o].attributes||{},this._fragment.associations[e].namespace[o].attributes[t]},n.prototype.setAssociationNamespaceAttribute=function(t,e,o,n){var i=this._fragment.associations[o].namespace;i[n]=i[n]||{},i[n].attributes=i[n].attributes||{},this._fragment.associations[o].namespace[n].attributes[t]=e},n.prototype.addAssociationNamespaceAttribute=function(t,e,o,n){var r=this._fragment.associations[o].namespace;if(r[n]=r[n]||{},r[n].attributes=r[n].attributes||{},this._fragment.associations[o].namespace[n].attributes[t])throw i.invalidState;this.setAssociationNamespaceAttribute(t,e,o,n)},n.prototype.removeAssociationNamespaceAttribute=function(t,e,o){delete this._fragment.associations[e].namespace[o].attributes[t]},n.prototype.hasAssociationNamespace=function(t,e){var o=this._fragment.associations[t].namespace[e];return o?!0:!1},n.prototype.listAssociationNamespaceAttributes=function(t,e){var o=this._fragment.associations[t].namespace;return o[e]=o[e]||{},o[e].attributes=o[e].attributes||{},Object.keys(this._fragment.associations[t].namespace[e].attributes)},self.getAssociationNamespaceData=function(t,e){var o=this._fragment.associations[t].namespace;return o[e]=o[e]||{},o[e].attributes=o[e].attributes||{},this._fragment.associations[t].namespace[e].data},n.prototype.setAssociationNamespaceData=function(t,e,o){var n=this._fragment.associations[e].namespace;n[o]=n[o]||{},n[o].attributes=n[o].attributes||{},this._fragment.associations[e].namespace[o].data=t},n.prototype._sync=function(t){var e=this;e._syncDriver.sync(t)},n.prototype.refresh=function(t){function e(e,n){return e?t(e):(o._fragment=new m({text:n}),t(!1))}var o=this;o._sync(function(n){n===i.itemMirrorNotCurrent?o._xooMLDriver.getXooMLFragment(e):n?t(n):o._xooMLDriver.getXooMLFragment(e)})},n.prototype.getCreator=function(){return this._creator},n.prototype.save=function(t){function e(e){return e?t(e):n._unsafeWrite(o)}function o(e){return t(e)}var n=this;n._sync(e)},self._isURL=function(t){return/^http:\/\//.exec(t)},e.exports=n,window&&(window.ItemMirror=window.ItemMirror||n)},{"./AssociationEditor":1,"./FragmentEditor":2,"./ItemDriver":3,"./SyncDriver":5,"./XooMLDriver":7,"./XooMLExceptions":8,"./XooMLUtil":9}],5:[function(t,e,o){"use strict";function n(t){var e=this;e._itemMirror=t,e._itemDriver=t._itemDriver,e._xooMLDriver=t._xooMLDriver}function i(t,e){return t.commonData.localItem>e.commonData.localItem?1:t.commonData.localItem<e.commonData.localItem?-1:0}var r=(t("./XooMLExceptions"),t("./XooMLConfig"),t("./XooMLUtil"),t("./FragmentEditor"));t("./AssociationEditor"),t("./XooMLExceptions");n.prototype.sync=function(t){function e(e,i){return e?t(e):(n=i,void a._xooMLDriver.getXooMLFragment(o))}function o(e,o){if(404===e){var s=a._itemMirror._fragment.toString();return a._xooMLDriver.setXooMLFragment(s,function(e){t(e?e:!1)})}if(e)return t(e);var c,m=0,u=!0;a._fragmentEditor=new r({text:o}),c=Object.keys(a._fragmentEditor.associations).map(function(t){return a._fragmentEditor.associations[t]}).filter(function(t){return null!==t.commonData.localItem}),n.sort(i),c.sort(i);var p=n.map(function(t){return t.commonData.localItem}),l=c.map(function(t){return t.commonData.localItem});return p.forEach(function(t,e){var o=l.lastIndexOf(t,m);if(-1===o){u=!1;var i=n[e];a._fragmentEditor.associations[i.commonData.ID]=i}else c.slice(m,o).forEach(function(t){u=!1,delete a._fragmentEditor.associations[t.guid]}),m=o+1}),c.slice(m,l.length).forEach(function(t){u=!1,delete a._fragmentEditor.associations[t.commonData.ID]}),u?t(!1):(a._fragmentEditor.updateID(),void a._xooMLDriver.setXooMLFragment(a._fragmentEditor.toString(),function(e){return t(e?e:!1)}))}var n,a=this;a._itemDriver.listItems(a._itemMirror._groupingItemURI,e)},e.exports=n},{"./AssociationEditor":1,"./FragmentEditor":2,"./XooMLConfig":6,"./XooMLExceptions":8,"./XooMLUtil":9}],6:[function(t,e,o){e.exports={schemaVersion:"0.54",schemaLocation:"http://kftf.ischool.washington.edu/xmlns/xooml",xooMLFragmentFileName:"XooML2.xml",maxFileLength:50,createAssociationSimple:{displayText:!0},createAssociationLinkNonGrouping:{displayText:!0,itemURI:!0,localItemRequested:!1},createAssociationLinkGrouping:{displayText:!0,groupingItemURI:!0,xooMLDriverURI:!0},createAssociationCreate:{displayText:!0,itemName:!0,isGroupingItem:!0}}},{}],7:[function(t,e,o){function n(t,e){var o=this;if(!t.clientInterface)throw new Error("Missing client interface in options!");this._parentURI=t.associatedItem||"root",this.clientInterface=t.clientInterface,this._fragmentURI=t.fragmentURI?t.fragmentURI:null;var n=this.clientInterface.auth2.getAuthInstance().currentUser.get().getAuthResponse();return this._AUTH_HEADER={Authorization:"Bearer "+n.access_token},this._DRIVE_FILE_API="https://www.googleapis.com/drive/v2/files/",e(!1,o)}var i=(t("./XooMLExceptions"),t("./XooMLConfig"));n.prototype._readFile=function(t){var e=this;$.ajax({url:e._DRIVE_FILE_API+e._fragmentURI,data:"alt=media",dataType:"text",headers:e._AUTH_HEADER}).then(function(e){t(!1,e)})},n.prototype._searchXooML=function(t,e){var o=this,n="title = '"+i.xooMLFragmentFileName+"' and '"+e+"' in parents",r=this.clientInterface.client.drive.files.list({maxResults:10,q:n});r.execute(function(e){var n=e.items[0];return e.items.length>1&&(console.warn("Mutliple XooML files found, only using first one. Please delete extras"),console.log(e.items)),n?(o._fragmentURI=n.id,void o._readFile(t)):t("XooML Not Found")})},n.prototype.getXooMLFragment=function(t){return this._fragmentURI?(console.log("GENERAL CASE"),void this._readFile(t,this._fragmentURI)):(console.log("SEARCH CASE"),this._searchXooML(t,this._parentURI))},n.prototype.setXooMLFragment=function(t,e){function o(e){var o=gapi.client.request({path:"/upload/drive/v2/files/"+r._fragmentURI,method:"PUT",params:{uploadType:"media"},body:t});o.execute(function(t){e(!1)},function(t){console.error(t),e(t)})}function n(t,e){var o="-------314159265358979323846",n="\r\n--"+o+"\r\n",a="\r\n--"+o+"--",s=new FileReader;s.readAsBinaryString(t),s.onload=function(c){var m=t.type||"application/octet-stream",u={title:i.xooMLFragmentFileName,mimeType:m,parents:[{kind:"drive#parentReference",id:r._parentURI}]};console.log("XooML Metadata for writing"),console.log(u);var p=btoa(s.result),l=n+"Content-Type: application/json\r\n\r\n"+JSON.stringify(u)+n+"Content-Type: "+m+"\r\nContent-Transfer-Encoding: base64\r\n\r\n"+p+a,f=gapi.client.request({path:"/upload/drive/v2/files",method:"POST",params:{uploadType:"multipart"},headers:{"Content-Type":'multipart/mixed; boundary="'+o+'"'},body:l});f.execute(function(t){r._fragmentURI=t.id,e(!1)},function(t){e("Could not write out XooML Fragment",t)})}}var r=this,a="text/xml",s=new Blob([t],{type:a,fileName:i.xooMLFragmentFileName});r._fragmentURI?o(e):n(s,e)},n.prototype.checkExists=function(t){var e=this;if(this._fragmentURI)$.get({url:_DRIVE_FILE_API+e._fragmentURI,headers:_AUTH_HEADER}).then(function(){t(!1)}).fail(function(){t("XooML file: "+e._fragmentURI+" not found")});else{var o="title = '"+i.xooMLFragmentFileName+"' and '"+e._parentURI+"' in parents",n=this.clientInterface.client.drive.files.list({maxResults:1,q:o});n.execute(function(o){t(o.items[0]?!1:"XooML file not found in directory: "+e._parentURI)})}},e.exports=n},{"./XooMLConfig":6,"./XooMLExceptions":8}],8:[function(t,e,o){e.exports={notImplemented:"NotImplementedException",missingParameter:"MissingParameterException",nullArgument:"NullArgumentException",invalidType:"InvalidTypeException",invalidState:"InvalidStateArgument",xooMLUException:"XooMLUException",itemUException:"ItemUException",nonUpgradeableAssociationException:"NonUpgradeableAssociationException",invalidArgument:"InvalidOptionsException",itemAlreadyExists:"ItemAlreadyExistsException",itemMirrorNotCurrent:"ItemMirrorNotCurrent"}},{}],9:[function(t,e,o){"use strict";var n=t("./XooMLExceptions"),i=(t("./XooMLConfig"),{"[object Boolean]":"boolean","[object Number]":"number","[object String]":"string","[object Function]":"function","[object Array]":"array","[object Date]":"date","[object RegExp]":"regexp","[object Object]":"object","[object Error]":"error"}),r={hasOptions:function(t,e){if(!t||!e)throw n.nullArgument;if(!r.isObject(t)||!r.isObject(e))throw n.invalidType;var o,i,a;if(a=0,!(Object.keys(e).length<=Object.keys(t).length))return!1;for(o in t)if(t.hasOwnProperty(o)&&(i=t[o],!e.hasOwnProperty(o))){if(i)return!1;a+=1}return Object.keys(e).length<=Object.keys(t).length-a},checkCallback:function(t){if(!t)throw n.nullArgument;if(!r.isFunction(t))throw n.invalidType},isGUID:function(t){return"string"===r.getType(t)?!0:!1},isArray:function(t){return"array"===r.getType(t)},isObject:function(t){return"object"===r.getType(t)},isFunction:function(t){return null!==t},isString:function(t){return"string"===r.getType(t)},isBoolean:function(t){return"boolean"===r.getType(t)},generateGUID:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=16*Math.random()|0,o="x"==t?e:3&e|8;return o.toString(16)})},getType:function(t){return null===t?String(t):"object"==typeof t||"function"==typeof t?i[t.toString()]||"object":typeof t},endsWith:function(t,e){return-1!==t.indexOf(e,t.length-e.length)},clone:function(t){var e;if(null===t||"object"!=typeof t)return t;if(t instanceof Date)return e=new Date,e.setTime(t.getTime()),e;if(t instanceof Array){e=[];for(var o=0,i=t.length;i>o;o++)e[o]=r.clone(t[o]);return e}if(t instanceof Object){e={};for(var a in t)t.hasOwnProperty(a)&&(e[a]=r.clone(t[a]));return e}throw n.invalidType}};e.exports=r},{"./XooMLConfig":6,"./XooMLExceptions":8}]},{},[4]);


var XooMLExceptions = require('./XooMLExceptions');
var XooMLUtil = require('./XooMLUtil');
var XooMLDriver = require('./google-xooml-driver');
var ItemDriver = require('./google-item-driver');
var SyncDriver = require('./SyncDriver');
var FragmentEditor = require('./FragmentEditor');
var AssociationEditor = require('./AssociationEditor');

    function ItemMirror(options, callback) {
    XooMLUtil.checkCallback(callback);
    if (!options) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }

   var self = this, xooMLFragmentURI, displayName;

   this._xooMLDriverClient = options.xooMLDriver.clientInterface;
   this._itemDriverClient = options.xooMLDriver.clientInterface;

    // private variables
    self._xooMLDriver = null;
    self._itemDriver = null;
    self._syncDriver = null;
    self._creator = options.creator || null;
    self._groupingItemURI = options.groupingItemURI;
    self._newItemMirrorOptions = options;

    // displayName for the fragment
    // It may make more sense to set this later once we have the drivers loaded
    // displayName = this._xooMLDriver.getDisplayName();
    displayName = 'TBD';

    self.fragmentURI = options.fragmentURI || null;
    options.xooMLDriver.fragmentURI = xooMLFragmentURI;

    // First load the XooML Driver
    new XooMLDriver(options.xooMLDriver, loadXooMLDriver);

    function loadXooMLDriver(error, driver) {
      if (error) return callback(error);

      self._xooMLDriver = driver; // actually sets the XooMLDriver

      self._xooMLDriver.getXooMLFragment(processXooML);
    }

    function processXooML(error, fragmentString) {
      // Case 2: Since the fragment doesn't exist, we need
      // to construct it by using the itemDriver
      if (error === 'XooML Not Found') {
        new ItemDriver(options.itemDriver, createFromItemDriver);
      } else if (error) {
        return callback(error);
      }

      // Case 1: It already exists, and so all of the information
      // can be constructed from the saved fragment
      else {
        createFromXML(fragmentString);
      }
    }

    function createFromXML(fragmentString) {
      self._fragment = new FragmentEditor({text: fragmentString});

      new ItemDriver(options.itemDriver, function(error, driver) {
        if (error) return callback(error);
        self._itemDriver = driver;

        self._syncDriver = new SyncDriver(self);

        // Do a refresh in case something has been added or deleted in
        // the directory since the last write
        self.refresh(function() {
          return callback(false, self);
        });
      });
    }

    function createFromItemDriver(error, driver) {
      self._itemDriver = driver;

      self._itemDriver.listItems(self._groupingItemURI, buildFragment);
    }

    function buildFragment(error, associations){
      if (error) return callback(error);

      self._fragment = new FragmentEditor({
        commonData: {
          itemDescribed: self._groupingItemURI,
          displayName: displayName,
          itemDriver: "dropboxItemDriver",
          xooMLDriver: "dropboxXooMLDriver",
          syncDriver: "itemMirrorSyncUtility"
        },
        associations: associations
      });

      self._syncDriver = new SyncDriver(self);

      // Because the fragment is being built from scratch, it's safe
      // to save it directly via the driver.
      self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
        if (error) {
          throw new Error(error);
        }
      });

      return callback(false, self);
    }
  }

  /**
   * @method getDisplayName
   * @return {String} The display name of the fragment.
   */
  ItemMirror.prototype.getDisplayName = function() {
    return this._fragment.commonData.displayName;
  };

  /**
   * @method setDisplayName
   * @param {String} name The display text to set for the fragment
   */
  ItemMirror.prototype.setDisplayName = function(name) {
    this._fragment.commonData.displayName = name;
  };

  /**
   *
   * @method getSchemaVersion
   * @return {String} XooML schema version.
   */
  ItemMirror.prototype.getSchemaVersion = function() {
    return this._fragment.commonData.schemaVersion;
  };

  /**
   *
   * @method getSchemaLocation
   * @return {String} XooML schema location.
   */
  ItemMirror.prototype.getSchemaLocation = function() {
    return this._fragment.commonData.schemaLocation;
  };

  /**
   * Returns URI pointing to item described by the metadata of a fragment. A URI
   * might point to just about anything that can be interpreted as a grouping
   * item. For example: a conventional file system folder or a “tag as
   * supported by any of several applications.
   *
   * @method getURIforItemDescribed
   * @return {String} A URI pointing to item described by the metadata
   * of a fragment if it exists, else returns null.
   *
   */
  ItemMirror.prototype.getURIforItemDescribed = function() {
    return this._fragment.commonData.itemDescribed;
  };

  ItemMirror.prototype.getPublicURL = function(GUID) {
    return this._fragment.associations[GUID].commonData.publicURL;
  }

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   *
   * @method getAssociationDisplayText
   * @return {String} The display text for the association with the given GUID.
   *
   * @param {String} GUID GUID representing the desired association.
   */
    ItemMirror.prototype.getAssociationDisplayText = function(GUID) {
    return this._fragment.associations[GUID].commonData.displayText;
  };

  /**
   * Sets the display text for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID or displayName is null. <br/>
   * Throws InvalidTypeException if GUID or displayName is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationDisplayText
   *
   * @param {String}   GUID        GUID of the association to set.
   * @param {String}   displayText Display text to be set.
   */
    ItemMirror.prototype.setAssociationDisplayText = function(GUID, displayText) {
    this._fragment.associations[GUID].commonData.displayText = displayText;
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationLocalItem
   * @return {String} The local item for the association with the given GUID.
   *
   * @param {String} GUID GUID of the association to get.
   */
    ItemMirror.prototype.getAssociationLocalItem = function(GUID) {
    return this._fragment.associations[GUID].commonData.localItem;
  };

  /**
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationAssociatedItem
   * @return {String} The associated item for the association with the given GUID.
   * @param {String} GUID GUID of the association to get.
   */
    ItemMirror.prototype.getAssociationAssociatedItem = function(GUID) {
    return this._fragment.associations[GUID].commonData.associatedItem;
  };

  /**
   * @method getFragmentNamespaceAttribute
   * @return {String} Returns the value of the given attributeName for the
   * fragmentNamespaceData with the given namespaceURI.
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.getFragmentNamespaceAttribute = function(attributeName, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.namespace[uri].attributes[attributeName];
  };

  /**
   * Sets the value of the given attributeName with the given attributeValue
   * for the fragmentNamespaceData with the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, attributeValue, or
   * namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName, attributeValue, or
   * namespaceURI is not a String. <br/>
   *
   * @method setFragmentNamespaceAttribute
   * @param {String} attributeName  Name of the attribute to be set.
   * @param {String} attributeValue Value of the attribute to be set.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.setFragmentNamespaceAttribute = function(attributeName, attributeValue, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.namespace[uri].attributes[attributeName] = attributeValue;
  };

  /**
   * Adds the given attributeName to the fragment's current namespace
   *
   * Throws an InvalidStateException when the attribute already exists
   *
   * @method addFragmentNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} uri Namespace URI
   */
  // TODO: Possibly remove? Why not just get and set
  ItemMirror.prototype.addFragmentNamespaceAttribute = function(attributeName, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    if (this._fragment.namespace[uri].attributes[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setFragmentNamespaceAttribute(attributeName, uri);
  };

  /**
   * Removes the fragment namespace attribute with the given namespaceURI.
   *
   * Throws NullArgumentException if attributeName, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, or namespaceURI is not
   * a String. <br/>
   * Throws an InvalidStateException when the given attributeName is not an
   * attribute. <br/>
   *
   * @method removeFragmentNamespaceAttribute
   * @param {String} attributeName Name of the attribute.
   * @param {String} uri  Namespace URI
   *
   */
  ItemMirror.prototype.removeFragmentNamespaceAttribute = function(attributeName, uri) {
    delete this._fragment.namespace[uri].attributes[attributeName];
  };

  /**
   * Checks if the fragment has the given namespaceURI.
   *
   * Currently cannot find a way to list the namespaces (no DOM
   * standard method for doing so). So this fuction will ALWAYS RETURN
   * FALSE for now.
   *
   * @method hasFragmentNamespace
   * @return {Boolean} True if the fragment has the given
   * namespaceURI, otherwise false.
   *
   * @param {String} uri URI of the namespace for the association.
   *
   */
  ItemMirror.prototype.hasFragmentNamespace = function (uri) {
    var namespace = this._fragment.namespace[uri];
    if (namespace) { return true; }
    else { return false; }
  };

  /**
   * @method listFragmentNamespaceAttributes
   * @return {String[]} An array of the attributes within the
   * fragmentNamespaceData with the given namespaceURI.
   * @param {String} uri Namespace URI
   *
  */
  ItemMirror.prototype.listFragmentNamespaceAttributes = function(uri) {
    return Object.keys(this._fragment.namespace[uri].attributes);
  };

  /**
   * @method getFragmentNamespaceData
   * @return {String} The fragment namespace data with the given namespace URI.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.getFragmentNamespaceData = function(uri) {
    return this._fragment.namespace[uri].data;
  };

  /**
   * Sets the fragment namespace data with the given namespaceURI.
   *
   * @method setFragmentNamespaceData
   *
   * @param {String} data Fragment namespace data to be set.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.setFragmentNamespaceData = function (data, uri) {
    var ns = this._fragment.namespace;
    ns[uri] = ns[uri] || {};

    this._fragment.namespace[uri].data = data;
  };

  /**
   * Creates an ItemMirror from the associated grouping item represented by
   * the given GUID.
   *
   * Throws NullArgumentException if GUID or callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a string, and callback is
   * not a function. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method createItemMirrorForAssociatedGroupingItem
   * @return {ItemMirror} Possibly return an itemMirror if the GUID is a grouping item
   *
   * @param {String} GUID GUID of the association to create the ItemMirror
   *                 from.
   *
   */
  ItemMirror.prototype.createItemMirrorForAssociatedGroupingItem = function (GUID, callback) {
    var self = this,
        isGrouping,
        xooMLOptions,
        itemOptions,
        syncOptions,
        uri;

    itemOptions = {
      driverURI: "GoogleItemUtility",
      clientInterface: this._itemDriverClient,
      // Note that this needs to be changed, we want to point to the grouping item's id
      associatedItem: self.getAssociationAssociatedItem(GUID)
    };
    xooMLOptions = {
      fragmentURI: uri,
      driverURI: "GoogleXooMLUtility",
      clientInterface: this._xooMLDriverClient,
      associatedItem: self.getAssociationAssociatedItem(GUID)
    };
    syncOptions = {
      utilityURI: "SyncUtility"
    };

    isGrouping = self.isAssociationAssociatedItemGrouping(GUID);
    if (!isGrouping) {
      // Need to standardize this error
      return callback("Association not grouping, cannot continue");
    }

    new ItemMirror(
      {groupingItemURI: self.getAssociationAssociatedItem(GUID),
       xooMLDriver: xooMLOptions,
       itemDriver: itemOptions,
       syncDriver: syncOptions,
       creator: self
      },
      function (error, itemMirror) {
        return callback(error, itemMirror);
      }
    );
  };

  /**
   * Creates an association based on the given options and the following
   * cases.
   *
   * Cases 1, 2, 7 implemented. All else are not implemented.
   *
   * 1. Simple text association declared phantom. <br/>
   * 2. Link to existing non-grouping item, phantom. This can be a URL <br/>
   * 3. Link to existing non-grouping item, real. <br/>
   * 4. Link to existing grouping item, phantom. <br/>
   * 5. Link to existing grouping item, real. <br/>
   * 6. Create new local non-grouping item. <br/>
   * 7. Create new local grouping item. <br/>
   *
   * Throws NullArgumentException when options, or callback is null. <br/>
   * Throws InvalidTypeException when options is not an object and callback
   * is not a function. <br/>
   * Throws MissingParameterException when an argument is missing for an expected
   * case. <br/>
   *
   * @method createAssociation
   *
   * @param {Object} options Data to create an new association for.
   *
   *  @param {String}  options.displayText Display text for the association.
   *                   Required in all cases.
   *
   *  @param {String}  options.itemURI URI of the item. Required for case 2 & 3. Note: Please ensure "http://" prefix exists at the beginning of the string when referencing a Web URL and not an Item.
   *
   *  @param {Boolean} options.localItemRequested True if the local item is
   *                   requested, else false. Required for cases 2 & 3.
   *
   *  @param {String}  options.groupingItemURI URI of the grouping item.
   *                   Required for cases 4 & 5.
   *
   *  @param {String}  options.xooMLDriverURI URI of the XooML driver for the
   *                   association. Required for cases 4 & 5.
   *
   *  @param {String}  options.localItem URI of the new local
   *                   non-grouping/grouping item. Required for cases 6 & 7.
   *
   *  @param {String}  options.isGroupingItem True if the item is a grouping
   *                   item, else false. Required for cases 6 & 7.
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   *  @param {String}   callback.GUID GUID of the association created.
   */
  ItemMirror.prototype.createAssociation = function (options, callback) {
    var self = this,
        association,
        saveOutFragment;

    saveOutFragment = function(association){
      var guid = association.commonData.ID;
      // adds the association to the fragment
      self._fragment.associations[guid] = association;

      // Save changes out the actual XooML Fragment
      self.save( function(error){
        return callback(error, guid);
      });
    };

    if (!XooMLUtil.isFunction(callback)) {
      throw XooMLExceptions.invalidType;
    }
    if (!XooMLUtil.isObject(options)) {
      return callback(XooMLExceptions.invalidType);
    }

    // Case 7
    if (options.displayText && options.localItem && options.isGroupingItem) {
      association = new AssociationEditor({
        commonData: {
          displayText: options.displayText,
          isGrouping: true,
          localItem: options.localItem,
          // Changed this part, and need to test folder creation to insure safety
          associatedItem: options.associatedItem
        }
      });

      // Now we use the itemDriver to actually create the folder
      // NOTE: untested
      self._itemDriver.createGroupingItem(options.displayText, function(error){
        if (error) return callback(error);

        return saveOutFragment(association);
      });
    }
    // Synchronous cases
    else {
      // Case 2
      if (options.displayText && options.itemURI) {
        association = new AssociationEditor({
          commonData: {
            displayText: options.displayText,
            associatedItem: options.itemURI,
            isGrouping: false
          }
        });
      }
      // Case 1
      else if (options.displayText) {
        association = new AssociationEditor({
          commonData: {
            displayText: options.displayText,
            isGrouping: false
          }
        });
      }

      return saveOutFragment(association);
    }
  };

  /**
   * @method isAssociationPhantom
   * @param {String} guid
   * @return {Boolean} True if the association of the given GUID is a
   * phantom association. False otherwise.
   */
  ItemMirror.prototype.isAssociationPhantom = function(guid) {
    var data = this._fragment.associations[guid].commonData;
    return !(data.isGrouping || data.localItem);
  };

  /**
   * Duplicates (copies) an association to another ItemMirror Object (representing a grouping item)
   *
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method copyAssociation
   *
   * @param {String} GUID GUID of the association you wish to copy/duplicate
   * @param {ItemMirror} ItemMirror ItemMirror representing the grouping item you want to move the GUID object to
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   ItemMirror.prototype.copyAssociation = function () {
    throw new Error('Method not implemented');
   };
  /**
   * Moves an association to another ItemMirror Object (representing a grouping item)
   *
   *
   * Throws NullArgumentException if GUID is null. <br/>
   * Throws InvalidTypeException if GUID is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method moveAssociation
   *
   * @param {String} GUID GUID of the item you want to paste or move
   * @param {ItemMirror} ItemMirror ItemMirror representing the grouping item you want to move the GUID object to
   *
   * @param {Function} callback Function to execute once finished.
   * @param {Object} callback.error Null if no error Null if no error has occurred
   *                 in executing this function, else it contains
   *                 an object with the error that occurred.
   */
   ItemMirror.prototype.moveAssociation = function () {
    throw new Error('Method not implemented');
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
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  ItemMirror.prototype.deleteAssociation = function (GUID, callback) {
    var self = this;

    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    // Save to ensure that the fragment is up to date
    return self.save(deleteContent);

    function deleteContent(error) {
      if (error) return callback(error);

      var isPhantom = self.isAssociationPhantom(GUID);

      if (!isPhantom) {
        var isGrouping = self.isAssociationAssociatedItemGrouping(GUID),
            // For dropbox support, path should be the full path that is
            // dynamically generated. Refer to case 39 for implementation
            // details. UNTESTED
            path = self.getAssociationAssociatedItem(GUID);

        delete self._fragment.associations[GUID];
        if (isGrouping) {
          return self._itemDriver.deleteGroupingItem(path, postDelete);
        } else {
          return self._itemDriver.deleteNonGroupingItem(path, postDelete);
        }
      } else {
        delete self._fragment.associations[GUID];

        // Now do an unsafe_write to commit the XML. It's okay because
        // save means that everything is synced, and this operation
        // was extremely quick
        return self._unsafeWrite(function(error) {
          if (error) return callback(error);
          else return callback();
        });
      }
    }

    // Now do a refresh since actual files were removed.
    function postDelete(error) {
      if (error) return callback(error);

      return self.refresh(function(error) {
        if (error) return callback(error);
        return callback(error);
      });
    }

  };

  /**
   * Upgrades a given association without a local item. Local item is named
   * by a truncated form of the display name of this ItemMirror if the
   * localItemURI is not given, else uses given localItemURI. Always
   * truncated to 50 characters.
   *
   * ONLY SUPPORTS SIMPLE PHANTOM ASSOCIATION TO ASSOCIATION WITH GROUPING ITEM
   *
   * Throws NullArgumentException when options is null. <br/>
   * Throws MissingParameterException when options is not null and a required
   * argument is missing.<br/>
   * Throws InvalidTypeException if GUID is not a string, and if callback
   * is not a function. <br/>
   * Throws InvalidState if the association with the given GUID cannot be
   * upgraded. <br/>
   *
   * @method upgradeAssociation
   *
   * @param {Object} options Data to construct a new ItemMirror with
   *
   *  @param {String} options.GUID of the association to be upgraded. Required
   *
   *  @param {String} options.localItemURI URI of the local item to be used if
   *                  a truncated display name is not the intended behavior.
   *                  Optional.
   *
   * @param {Function} callback Function to execute once finished.
   *
   *  @param {String}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  ItemMirror.prototype.upgradeAssociation = function () {
    throw new Error('Method not implemented');
  };

  /**
   * Renames the local item for the association with the given GUID.
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not a function. <br/>
   *
   * @method renameAssocaitionLocalItem
   *
   * @param {String} GUID GUID of the association.
   * @param {String} String String Name you want to rename the file to (including file extension)
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @param {String} callback.GUID The GUID of the association that was updated.
   */
  ItemMirror.prototype.renameAssociationLocalItem = function (GUID, newName, callback) {
    // This method needs a redesign, and can't be properly implemented the way
    // it is now. Instead, this needs to pass information to the acual item
    // driver and that needs to implement an agnostic new name format. This
    // path stuff is specific to dropbox and doesn't work
    var self = this;
    XooMLUtil.checkCallback(callback);
    if (!GUID) {
      return callback(XooMLExceptions.nullArgument);
    }
    if (!XooMLUtil.isGUID(GUID)) {
      return callback(XooMLExceptions.invalidType);
    }

    self.save(postSave);

    function postSave(error) {
      if (error) return callback(error);

      // This stuff needs to be replaced with a method that works for all stores
          // oldPath = PathDriver.joinPath(self._groupingItemURI, localItem),
          // newPath = PathDriver.joinPath(self._groupingItemURI, newName);

      self._itemDriver.rename(newName, postMove);
    }

    function postMove(error) {
      if (error) return callback(error);
      // This also needs to be more agnostic
      self._fragment.associations[GUID].commonData.localItem = newName;

      self._unsafeWrite(postWrite);
    }

    function postWrite(error) {
      if (error) return callback(error);

      self.refresh(postRefresh);
    }

    function postRefresh(error) {
      return callback(error, self._fragment.associations[GUID].commonData.ID);
    }
  };

  /**
   * A special method that is used for certain file operations where
   * calling a sync won't work. Essentially it is the save function,
   * sans syncing. This should __never__ be called be an application.
   * @method _unsafeWrite
   * @param callback
   * @param calback.error
   */
  ItemMirror.prototype._unsafeWrite = function(callback) {
    var self = this;

    // Note (12/8/2015) This was never used, but seems like it has purpose. May need to investigate
    //var tmpFragment = new FragmentEditor({text: content});
    self._fragment.updateID();
    return self._xooMLDriver.setXooMLFragment(self._fragment.toString(), function(error) {
      if (error) return callback(error);
      return callback(false);
    });
  };

  /**
   * Checks if an association's associatedItem is a grouping item
   *
   * Throws NullArgumentException if GUID, callback is null. <br/>
   * Throws InvalidTypeException if GUID is not a String, and if callback
   * is not an function. <br/>
   *
   * @method isAssociationAssociatedItemGrouping
   * @return {Boolean} True if the association with the given GUID's associatedItem is a grouping
   * item, otherwise false.
   *
   * @param GUID {String} GUID of the association to be to be checked.
   *
   */
  ItemMirror.prototype.isAssociationAssociatedItemGrouping = function(GUID) {
    return this._fragment.associations[GUID].commonData.isGrouping;
  };

  /**
   * Lists the GUIDs of each association.
   *
   * @method listAssociations
   *
   * @return {String[]} Array of the GUIDs of each association
   */
  ItemMirror.prototype.listAssociations = function() {
    return Object.keys(this._fragment.associations);
  };

  /**
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceAttribute
   * @return {String} The association namespace attribute with
   * the given attributeName and the given namespaceURI within the
   * association with the given GUID.
   *
   * @param {String} attributeName Name of the attribute to be returned.
   * @param {String} GUID          GUID of the association to return attribute from.
   * @param {String} uri Namspace URI
   *
   */
  ItemMirror.prototype.getAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.associations[GUID].namespace[uri].attributes[attributeName];
  };

  /**
   * Sets the association namespace attribute with the given attributeName
   * and the given namespaceURI within the association with the given GUID.
   *
   * Throws NullArgumentException if attributeName, attributeValue, GUID, or
   * namespaceURI is null. <br/>
   * Throws InvalidTypeException if attributeName, attributeValue, GUID, or
   * namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationNamespaceAttribute
   *
   * @param {String} attributeName  Name of the attribute to be set.
   * @param {String} attributeValue Value of the attribute to be set
   * @param {String} GUID           GUID of association to set attribute for.
   * @param {String} uri Namespace URI
   *
   */
  ItemMirror.prototype.setAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.associations[GUID].namespace[uri].attributes[attributeName] = attributeValue;
  };

  /**
   * Adds the given attributeName to the association with the given GUID and
   * namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   * Throws an InvalidStateException when the given attributeName has already
   * been added. <br/>
   *
   * @method addAssociationNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} attributeValue Value of the attribe to be set
   * @param {String} GUID          GUID of the association.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.addAssociationNamespaceAttribute = function(attributeName, attributeValue, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    if (this._fragment.associations[GUID].namespace[uri].attributes[attributeName]) {
      throw XooMLExceptions.invalidState;
    }
    this.setAssociationNamespaceAttribute(attributeName, attributeValue, GUID, uri);
  };

  /**
   * Removes the given attributeName to the association with the given GUID and
   * namespaceURI.
   *
   * Throws NullArgumentException if attributeName, GUID, or namespaceURI is
   * null. <br/>
   * Throws InvalidTypeException if attributeName, GUID, or namespaceURI is not
   * a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   * Throws an InvalidStateException when the given attributeName is not an
   * attribute. <br/>
   *
   * @method removeAssociationNamespaceAttribute
   *
   * @param {String} attributeName Name of the attribute.
   * @param {String} GUID          GUID of the association.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.removeAssociationNamespaceAttribute = function(attributeName, GUID, uri) {
    delete this._fragment.associations[GUID].namespace[uri].attributes[attributeName];
  };

  /**
   * @method hasAssociationNamespace
   * @return {Boolean} True if the association has the given
   * namespaceURI, else false.
   *
   * @param {String} GUID          GUID of the association.
   * @param {String} uri  Namespace URI
   *
   */
  ItemMirror.prototype.hasAssociationNamespace = function(GUID, uri) {
    var namespace = this._fragment.associations[GUID].namespace[uri];
    if (namespace) { return true; }
    else { return false; }
  };

  /**
   *
   * Throws NullArgumentException if GUID, namespaceURI is null. <br/>
   * Throws InvalidTypeException if GUID, namespaceURI is not a String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method listAssociationNamespaceAttributes
   * @return {String[]} An array of the association namespace
   * attributes with the given attributeName and the given
   * namespaceURI within the association with the given GUID.
   *
   * @param {String} GUID          GUID of association to list attributes for.
   * @param {String} uri Namespace URI
   */
  ItemMirror.prototype.listAssociationNamespaceAttributes = function (GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return Object.keys(this._fragment.associations[GUID].namespace[uri].attributes);
  };

  /**
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method getAssociationNamespaceData
   * @return {String} The association namespace data for an
   * association with the given GUID and the given namespaceURI.
   *
   * @param {String} GUID GUID of the association namespace data to
   * returned.
   * @param {String} uri Namespace URI
   */
  self.getAssociationNamespaceData = function (GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    return this._fragment.associations[GUID].namespace[uri].data;
  };

  /**
   * Sets the association namespace data for an association with the given GUID
   * and given namespaceURI using the given data.
   *
   * Throws NullArgumentException if data, GUID, or namespaceURI is null. <br/>
   * Throws InvalidTypeException if data, GUID, or namespaceURI is not a
   * String. <br/>
   * Throws InvalidGUIDException if GUID is not a valid GUID. <br/>
   *
   * @method setAssociationNamespaceData
   *
   * @param {String} data          Association namespace data to set. Must be
   *                               valid fragmentNamespaceData.
   * @param {String} GUID          GUID of the association namespace data to set.
   */
  ItemMirror.prototype.setAssociationNamespaceData = function (data, GUID, uri) {
    var ns = this._fragment.associations[GUID].namespace;
    ns[uri] = ns[uri] || {};
    ns[uri].attributes = ns[uri].attributes || {};

    this._fragment.associations[GUID].namespace[uri].data = data;
  };

  /**
   * Uses the specified ItemDriver and SyncDriver to synchronize the
   * local ItemMirror object changes. This is an implmentation of Synchronization
   * Driver which modifies the XooML Fragment according to the real structure
   * under the item described.
   *
   * @method sync
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   * @private
   */
  ItemMirror.prototype._sync = function (callback) {
    var self = this;

    self._syncDriver.sync(callback);
  };

  /**
   * Reloads the XooML Fragment
   *
   * @method refresh
   *
   * @param {Function} callback Function to execute once finished.
   *  @param {Object}   callback.error Null if no error has occurred
   *                    in executing this function, else an contains
   *                    an object with the error that occurred.
   */
  ItemMirror.prototype.refresh = function(callback) {
    var self = this;

    self._sync( function(error) {
      // This error means that sync changed the fragment
      // We then will reload the fragment based on the new XooML
      if (error === XooMLExceptions.itemMirrorNotCurrent) {
        self._xooMLDriver.getXooMLFragment(resetFragment);
      } else if (error) {
        callback(error);
      } else {
        self._xooMLDriver.getXooMLFragment(resetFragment);
      }
    });

    function resetFragment(error, content){
      if (error) return callback(error);

      self._fragment = new FragmentEditor({text: content});
      return callback(false);
    }
  };

  /**
   * @method getCreator
   *
   * @return {Object} The itemMirror that created this current
   * itemMirror, if it has one. Note that this isn't the same as
   * asking for a 'parent,' since multiple itemMirrors can possibly
   * link to the same one
   *
   */
  ItemMirror.prototype.getCreator = function () {
    return this._creator;
  };


  /**
   * Saves the itemMirror object, writing it out to the
   * fragment. Fails if the GUID generated on last write for the
   * itemMirror and the XooML fragment don't match.
   *
   * @method save
   *
   * @param callback
   *  @param callback.error Returns false if everything went ok,
   *  otherwise returns the error
   */
  ItemMirror.prototype.save = function(callback) {
    var self = this;

    self._sync(postSync);

    function postSync(error) {
      if (error) return callback(error);

      return self._unsafeWrite(postWrite);
    }

    function postWrite(error) {
      return callback(error);
    }
  };

/**
 * Checks if the AssociatedItem String passed into it is a URL or not.
 *
 * @method _isURL
 * @return {Boolean} True if it is an HTTP URL, false otherwise
 * (HTTPS will fail)
 * @private
 * @param {String} URL
 */
  self._isURL = function (URL){
    return /^http:\/\//.exec(URL);
  };


// This makes the pacakge accessible as a node module
module.exports = ItemMirror;

// This attaches the library as a global if it doesn't already exist
if (window) { // Checks for window object so we don't break potential node usage
  window.ItemMirror = window.ItemMirror || ItemMirror
}