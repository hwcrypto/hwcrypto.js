# hwcrypto.js
> Browser JavaScript interface for signing with hardware tokens

* [![Bower version](https://badge.fury.io/bo/hwcrypto.svg)](http://bower.io/search/?q=hwcrypto)
* [![Build Status](https://travis-ci.org/open-eid/hwcrypto.js.svg?branch=master)](https://travis-ci.org/open-eid/hwcrypto.js)


## Get started

The easiest way for managing JavaScript-s on a website is with [Bower](http://bower.io/):

        $ bower install --save hwcrypto

Alternatively you can download the files from [release area](https://github.com/open-eid/hwcrypto.js/releases).

`hwcrypto.js` itself does not do much, it depends on trusted platform code (installed separately and often running outside of the browser) to do the heavy lifting. 

## Features

Version 0.0.9 has built-in support for:
- [NPAPI style synchronous plugins for Firefox, Safari and IE](https://github.com/open-eid/browser-token-signing)
- [Chrome messaging extension](https://github.com/open-eid/chrome-token-signing)

Supports all [latest browsers](http://browsehappy.com/):
- Chrome 40+
- Firefox
- IE 8+*
- Safari

*Support for IE8-IE10 requires a Promises polyfill; IE8 and IE9 also require TypedArray polyfill. Complimentary code is bundled into `hwcrypto-legacy.js`:
  - https://github.com/inexorabletash/polyfill (license: Public Domain / MIT)
  - https://github.com/getify/native-promise-only/ (license: MIT)

Distribution and installation of the necessary platform components is out of scope of this project.

For further instructions on how to use the interface please have a look at [API specification](https://github.com/open-eid/hwcrypto.js/wiki/ModernAPI)

For background information about the project and the eID web task force, please head to the [wiki](https://github.com/open-eid/hwcrypto.js/wiki#eid-web-tf)

## Support

For any bugs in the JavaScript component, please open an issue on Github.

## ChangeLog
- 0.0.9
  - Have only typed arrays and promises in the legacy helper
- 0.0.8
  - Make internal API also asynchronous, to work with old IE-s
  - Have a convenience-bundle `hwcrypto-legacy.js`
