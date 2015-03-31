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

Version 0.0.7 has built-in support for:
- [NPAPI style synchronous plugins for Firefox, Safari and IE](https://github.com/open-eid/browser-token-signing)
- [Chrome messaging extension](https://github.com/open-eid/chrome-token-signing)

Supports all [latest browsers](http://browsehappy.com/):
- Chrome 40+
- Firefox
- IE 11
- Safari

Distribution and installation of the necessary platform components is out of scope of this project.

For further instructions on how to use the interface please have a look at [API specification](https://github.com/open-eid/hwcrypto.js/wiki/ModernAPI)

For background information about the project and the eID web task force, please head to the [wiki](https://github.com/open-eid/hwcrypto.js/wiki#eid-web-tf)

## Support

For any bugs in the JavaScript component, please open an issue on Github.
