# hwcrypto.js &nbsp;&nbsp; [![Bower version](https://badge.fury.io/bo/hwcrypto.svg)](http://bower.io/search/?q=hwcrypto) [![Build Status](https://travis-ci.org/hwcrypto/hwcrypto.js.svg?branch=master)](https://travis-ci.org/hwcrypto/hwcrypto.js)
> Browser JavaScript library for working with hardware tokens

## Get started

The easiest way for managing JavaScript-s on a website is with [Bower](https://bower.io/):

        $ bower install --save hwcrypto

Alternatively you can download the files from [release area](https://github.com/hwcrypto/hwcrypto.js/releases).

`hwcrypto.js` itself does not do much, it depends on trusted platform code (installed separately and often running outside of the browser) to do the heavy lifting. 

## Features

Latest version has built-in support for:
- [NPAPI style synchronous plugins for Firefox, Safari and IE](https://github.com/hwcrypto/browser-token-signing)
- [WebExtension for Native Messaging](https://github.com/hwcrypto/chrome-token-signing)

Supports all [latest browsers](http://browsehappy.com/):
- Chrome 40+
- Firefox
- IE 8+
- Safari

NOTE: The API makes use of [Promises](http://caniuse.com/#feat=promises) and [Typed Arrays](http://caniuse.com/#feat=typedarrays). Some browsers, notably older IE-s, require polyfills for them. Complimentary code is bundled into [`hwcrypto-legacy.js`](hwcrypto-legacy.js):
  - https://github.com/inexorabletash/polyfill (license: Public Domain / MIT)
  - https://github.com/getify/native-promise-only/ (license: MIT)

Distribution and installation of any necessary backend components is out of scope of this project.

## Developer information 
For further instructions on how to use the interface please have a look at [API specification v1](https://github.com/hwcrypto/hwcrypto.js/wiki/API)

For background information about the project and other volatile information, please head to the [wiki](https://github.com/hwcrypto/hwcrypto.js/wiki#eid-web-tf)

## Support

For any bugs and enhancements, please open an issue on Github. For issues with specific backends, please file tickets with backend components.

## ChangeLog
- 0.0.11
  - Do not require Chrome for WebExtension check (to support Firefox and possibly Edge in the future)
- 0.0.10
  - Minor speed improvements and fixes for older IE-s
- 0.0.9
  - Have only typed arrays and promises in the legacy helper
- 0.0.8
  - Make internal API also asynchronous, to work with old IE-s
  - Have a convenience-bundle `hwcrypto-legacy.js`
