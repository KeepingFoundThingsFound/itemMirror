# Authentication

ItemMirror definitely needs to come up with a standard way of dealing with
authentication. It's terrible to have to import entire external libraries to get
only a shallow feature subset, and each is a little different.

However, each of the ways that we interact with outside services can actually be
encapsulated in some common patterns that should make dealing with everything
together quite simple.

## OAuth 2.0 Spec

All authentication that we appear to need to deal with can be encapsulated with
the [OAuth 2.0 Implicit Authorization grant flow](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2#grant-type-implicit).
This guide on digital ocean is a good starting point. Additionally we can find
extra resources for each respective service:

- [Google](https://developers.google.com/identity/protocols/OAuth2UserAgent)
- [Dropbox](https://developers.google.com/identity/protocols/OAuth2UserAgent)

## Designing the API for ItemMirror

We want to make authenticating with a variety of services to be as simple as
possible for devs, so that they can support a variety of services easily!
Forcing them to include external dependencies is not only likely to limit
supported platforms (because we then make it the responsiblity of the dev), it's
also expensive in terms of the amount of code required.

By creating a series of drivers that only implement the functionality needed,
what we gain is tha ability to provide everything with the core library, with
drastically increasing the space it takes up. Additionally we can save even more
space by encapsulating similar functionality.

Until IM scales and supports __many__ different types of drivers, it seems to
make sense to avoid dealing with the difficulty of multiple modules, and instead
stick to a single bundle system. A migration to multiple modules shouldn't be
too hard when we need to do that though, since we already are splitting code up
into modules internally.

### Example Usage

```js

var IM = require('item-mirror')

/*
1st param: the name of the SERVICE (this should be a symbol that you can look
up) that we are authorizing with. Note that this isn't the same as the driver.
It's not the XooML / Item / Sync Driver. This is just the command that we use to
start authenticating with the google service so that we can USE the XooML /
ItemDrivers

2nd param: Client_id

3rd param: Client_secret

4th param: Callback that is executed when the service is finally authenticated
*/

IM.authenticate('google', CLIENT, SECRET, callback)

/*
Now that we've authenticated with google, we can freely load the XooML and Item
Drivers which DEPEND on Google's service being authenticated

If we now try and create an ItemMirror and specify driverURIs, we will be
allowed to make an `ItemMirror` by specifying one of the drivers
*/

IM.construct({
  // other stuff
  'xooml-driver': IM.drivers.xooml.google,
  'item-driver': IM.drivers.item.google
}, callback)

/*

If we tried to use the dropbox drivers though, we wouldn't have an IM object,
instead what we would get is an error (in the callback for the constructor),
whining about an `AuthenticationDependency Error`. The dev would then understand
through the error that they need to authenticate first with Dropbox before
proceeding.
*/

```

### Exploring `IM.authenticate` callback

This method is really tricky because it requires not only proper auth flow with
the service, but it requires _user interaction_ and an event trigger in another
window. Ideally we don't lose the state of the application by requiring
redirection. 

iFrames can't be used, because the OAuth spec specifically [forbids this](http://tools.ietf.org/html/draft-ietf-oauth-v2-23#section-10.13).

We can try to avoid this situation by providing link in a _separate tab/window_.
Doing this makes it so that ItemMirror keeps all of the state in the
application. However the issue then becomes getting the Authorization token back
from the service.

Flow:

1. Log in
2. Approve ItemMirror
3. Get redirected to the application
  - The auth token is then a parameter of the URL

We _can_ pass the information back to the 'main' application by taking advantage of
the Session Storage event, and writing the values to local storage. The main
issue, is *how do we do this in an agnostic way that doesn't interfere with
apps?*. 

Can IM observe the URL when it loads initially, so that essentially we can load
a page that just get's closed, but loads IM, saves the info, and then moves on.

#### Potential Solution: IM Checks URL at start

What we can do is take advantage of the redirectURI and standardize this across
applications so that the route actually has signifigance. This way, when IM
loads it will first do a check on the URL, and if it recognizes that it's a
redirect from an authenticator, it will write the details to localstorage, and
leave a message asking to close the window, or just automatically close it (to
avoid confusion).

Then, in the original window where the link was clicked, the call back finally
gets executed from the event firing.

This COULD be problematic if dealing with _multiple_ ItemMirror apps
simoltaneously.

Another method that would be a part of the flow is a new function,
`IM.isAuthenticated`. Returns whether we have the token for a given service and
can start actually using it's API. All it would do is perform a lookup of the
localstorage key for a given service, but it's still important to keep that
behaviour well defined.

```js
IM.isAuthenticated('Name of service')
```

It would then be up to developers to present the URL to the user and initiate
the flow. To avoid _popup blocks_, we need to basically have the `window.open`
call take place inside of code directly within a click handler. We can leave it
up to the devs to make everything proper, or just provide the handler, and leave
it up to them to deal with attaching it to the ui!

```js
IM.genAuthHandler('dropbox', id, secret)
// Returns a Function, that is passed directly to a click handler. Used to
// bypass pop blockers
// It would ideally be a magic URL that just 'works'
```

#### Example Flow

```js

// Start up application

// About to construct an IM, first check if we're authenticated
if (IM.isAuthenticated('google')) {
  // yay, we can just construct
  afterAuthCallback(false)
} else {
  // Generate a handler
  var handler = IM.genAuthHandler('google', 'unique_id', 'super_secret_key')

  // Stick the handler on a very obvious button that the user needs to click on
  $('#authorize-button').click(handler)

  // Now we wait for the user to do the auth process and eventually return
  // When it's complete, a LocalStorage event will be fired, which then gets us
  // of here

  // When the 'dropbox' authentication event gets triggered, we then issue a
  // callback and proceed onto the next step
  IM.genAuthListener('dropbox')(afterAuthCallback(false))
}

function afterAuthCallback(error) {
  if (error) // explode

  // Now we are authenticated with the service and can safely construct IM
  // objects which require google drivers
}


```
