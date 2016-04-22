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

