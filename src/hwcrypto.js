// JavaScript library as described in
// https://github.com/open-eid/hwcrypto.js
var hwcrypto = (function hwcrypto() {
    'use strict';
    var _debug = function(x) {
        // console.log(x);
    };
    _debug("hwcrypto.js activated");
    // Fix up IE8
    window.addEventListener = window.addEventListener || window.attachEvent;
    // Returns "true" if a plugin is present for the MIME
    function hasPluginFor(mime) {
            if(navigator.mimeTypes && mime in navigator.mimeTypes) {
                return true;
            }
            return false;
        }
        // Checks if a function is present (used for Chrome)
    function hasExtensionFor(cls) {
        if(typeof window[cls] === 'function') return true;
        return false;
    }

    function _hex2array(str) {
        if(typeof str == 'string') {
            var len = Math.floor(str.length / 2);
            var ret = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                ret[i] = parseInt(str.substr(i * 2, 2), 16);
            }
            return ret;
        }
    }

    function _array2hex(args) {
        var ret = "";
        for(var i = 0; i < args.length; i++) ret += (args[i] < 16 ? "0" : "") + args[i].toString(16);
        return ret.toLowerCase();
    }

    function _mimeid(mime) {
        return "hwc" + mime.replace('/', '').replace('-', '');
    }

    function loadPluginFor(mime) {
            var element = _mimeid(mime);
            if(document.getElementById(element)) {
                _debug("Plugin element already loaded");
                return document.getElementById(element);
            }
            _debug('Loading plugin for ' + mime + ' into ' + element);
            // Must insert tag as string (not as an Element object) so that IE9 can access plugin methods
            var objectTag = '<object id="' + element + '" type="' + mime + '" style="width: 1px; height: 1px; position: absolute; visibility: hidden;"></object>';
            var div = document.createElement("div");
            div.setAttribute("id", 'pluginLocation' + element);
            document.body.appendChild(div);
            // Must not manipulate body's innerHTML directly, otherwise previous Element references get lost
            document.getElementById('pluginLocation' + element).innerHTML = objectTag;
            return document.getElementById(element);
        }
        // Important constants
    var digidoc_mime = 'application/x-digidoc';
    var digidoc_chrome = 'TokenSigning';
    // Some error strings
    var USER_CANCEL = "user_cancel";
    var NO_CERTIFICATES = "no_certificates";
    var INVALID_ARGUMENT = "invalid_argument";
    var TECHNICAL_ERROR = "technical_error";
    var NO_IMPLEMENTATION = "no_implementation";
    var NOT_ALLOWED = "not_allowed";
    // Probe all existing backends in a failsafe manner.
    function probe() {
            var msg = 'probe() detected ';
            // First try Chrome extensions
            if(hasExtensionFor(digidoc_chrome)) {
                _debug(msg + digidoc_chrome);
            }
            if(hasPluginFor(digidoc_mime)) {
                _debug(msg + digidoc_mime);
            }
        }
        // TODO: remove
    window.addEventListener('load', function(event) {
        // There's a timeout because chrome content script needs to be loaded
        probe();
    });
    // Backend for DigiDoc plugin
    function DigiDocPlugin() {
            this._name = "NPAPI/BHO for application/x-digidoc";
            var p = loadPluginFor(digidoc_mime);
            // keeps track of detected certificates and their ID-s
            var certificate_ids = {};

            function code2str(err) {
                _debug("Error: " + err + " with: " + p.errorMessage);
                switch(parseInt(err)) {
                    case 1:
                        return USER_CANCEL;
                    case 2:
                        return INVALID_ARGUMENT;
                    case 17:
                        // invalid hash length
                        return INVALID_ARGUMENT;
                    case 19:
                        return NOT_ALLOWED;
                    default:
                        _debug("Unknown error: " + err + " with: " + p.errorMessage);
                        return TECHNICAL_ERROR;
                }
            }

            function code2err(err) {
                return new Error(code2str(err));
            }
            this.check = function() {
                return new Promise(function(resolve, reject) {
                    // IE8 cannot access the newly inserted plugin object before the end of call queue
                    setTimeout(function() {
                        resolve(typeof p.version !== "undefined");
                    }, 0);
                });
            };
            this.getVersion = function() {
                return new Promise(function(resolve, reject) {
                    var v = p.version;
                    resolve(v);
                });
            };
            this.getCertificate = function(options) {
                // Ignore everything except language
                if(options && options.lang) {
                    p.pluginLanguage = options.lang;
                }
                return new Promise(function(resolve, reject) {
                    try {
                        var v = p.getCertificate();
                        if(parseInt(p.errorCode) !== 0) {
                            reject(code2err(p.errorCode));
                        } else {
                            // Store plugin-internal ID
                            certificate_ids[v.cert] = v.id;
                            resolve({
                                hex: v.cert
                            });
                        }
                    } catch(ex) {
                        _debug(ex);
                        reject(code2err(p.errorCode));
                    }
                });
            };
            this.sign = function(cert, hash, options) {
                return new Promise(function(resolve, reject) {
                    // get the ID of the certificate
                    var cid = certificate_ids[cert.hex];
                    if(cid) {
                        try {
                            //var v = p.sign(cid, hash, 'en'); // FIXME: only BHO requires language but does not use it
                            var language = options.lang || 'en';
                            //p.pluginLanguage = language;
                            var v = p.sign(cid, hash.hex, language);
                            resolve({
                                hex: v
                            });
                        } catch(ex) {
                            _debug(JSON.stringify(ex));
                            reject(code2err(p.errorCode));
                        }
                    } else {
                        _debug("invalid certificate: " + cert);
                        reject(new Error(INVALID_ARGUMENT));
                    }
                });
            };
        }
        // Backend for Digidoc Chrome Extension
    function DigiDocExtension() {
        this._name = "Chrome native messaging extension";
        var p = null;
        this.check = function() {
            return new Promise(function(resolve, reject) {
                if (!hasExtensionFor(digidoc_chrome)) {
                    return resolve(false);
                }
                // FIXME: remove this from content script!
                p = new window[digidoc_chrome]();
                if (p) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        };
        this.getVersion = function() {
            return p.getVersion();
        };
        this.getCertificate = function(options) {
            return p.getCertificate(options);
        };
        this.sign = function(cert, hash, options) {
            return p.sign(cert, hash, options);
        };
    }

    // Dummy
    function NoBackend() {
        this._name = "No implementation";
        this.check = function() {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        };
        this.getVersion = function() {
            return Promise.reject(new Error(NO_IMPLEMENTATION));
        };
        this.getCertificate = function() {
            return Promise.reject(new Error(NO_IMPLEMENTATION));
        };
        this.sign = function() {
            return Promise.reject(new Error(NO_IMPLEMENTATION));
        };
    }
    // Active backend
    var _backend = null;
    // To be exposed
    var fields = {};

    function _testAndUse(Backend) {
        return new Promise(function(resolve, reject) {
            var b = new Backend();
            b.check().then(function(isLoaded) {
                if (isLoaded) {
                    _debug("Using backend: " + b._name);
                    _backend = b;
                    resolve(true);
                } else {
                    _debug(b._name + " check() failed");
                    resolve(false);
                }
            });
        });
    }

    function _autodetect(force) {
        return new Promise(function(resolve, reject) {
            _debug("Autodetecting best backend");
            if (typeof force === 'undefined') {
                force = false;
            }
            if (_backend !== null && !force) {
                return resolve(true);
            }

            function tryDigiDocPlugin() {
                _testAndUse(DigiDocPlugin).then(function(result) {
                    if (result) {
                        resolve(true);
                    } else {
                        resolve(_testAndUse(NoBackend));
                    }
                });
            }

            // IE BHO
            if (navigator.userAgent.indexOf("MSIE") != -1 || navigator.userAgent.indexOf("Trident") != -1) {
                _debug("Assuming IE BHO, testing");
                return tryDigiDocPlugin();
            }

            // Chrome extension or NPAPI
            if (navigator.userAgent.indexOf("Chrome") != -1 && hasExtensionFor(digidoc_chrome)) {
                _testAndUse(DigiDocExtension).then(function(result) {
                    if (result) {
                        resolve(true);
                    } else {
                        tryDigiDocPlugin();
                    }
                });
                return;
            }

            // Other browsers with NPAPI support
            if (hasPluginFor(digidoc_mime)) {
                return tryDigiDocPlugin();
            }

            // No backend supported
            resolve(_testAndUse(NoBackend));
        });
    }
    // Use a specific backend or autodetect
    fields.use = function(backend) {
        return new Promise(function(resolve, reject) {
            if (typeof backend === "undefined" || backend === 'auto') {
                _autodetect().then(function(result) { resolve(result);});
            } else {
                if (backend === "chrome") {
                    resolve(_testAndUse(DigiDocExtension));
                } else if (backend === "npapi") {
                    resolve(_testAndUse(DigiDocPlugin));
                } else {
                    resolve(false); // unknown backend
                }
            }
        });
    };
    // Give debugging information.
    fields.debug = function() {
        return new Promise(function(resolve, reject) {
            var hwversion = "hwcrypto.js @@hwcryptoversion";
            _autodetect().then(function(result) {
                _backend.getVersion().then(function(version) {
                    resolve(hwversion + " with " + _backend._name + " " + version);
                }, function(error) {
                    resolve(hwversion + " with failing backend " + _backend._name);
                });
            });
        });
    };
    // Get a certificate
    fields.getCertificate = function(options) {
        if(typeof options !== 'object') {
            _debug("getCertificate options parameter must be an object");
            return Promise.reject(new Error(INVALID_ARGUMENT));
        }
        // If options does not specify a language, set to 'en'
        if(options && !options.lang) {
            options.lang = 'en';
        }
        return _autodetect().then(function(result) {
            // FIXME: dummy security check in website context
            if (location.protocol !== 'https:' && location.protocol !== 'file:') {
                return Promise.reject(new Error(NOT_ALLOWED));
            }
            return _backend.getCertificate(options).then(function(certificate) {
                // Add binary value as well
                if (certificate.hex && !certificate.encoded)
                    certificate.encoded = _hex2array(certificate.hex);
                return certificate;
            });
        });
    };
    // Sign a hash
    fields.sign = function(cert, hash, options) {
        if (arguments.length < 2)
            return Promise.reject(new Error(INVALID_ARGUMENT));
        // If options does not specify a language, set to 'en'
        if(options && !options.lang) {
            options.lang = 'en';
        }
        // Hash type and value must be present
        if (!hash.type || (!hash.value && !hash.hex))
            return Promise.reject(new Error(INVALID_ARGUMENT));

        // Convert Hash to hex and vice versa.
        // TODO: All backends currently expect the presence of Hex.
        if (hash.hex && !hash.value) {
            _debug("DEPRECATED: hash.hex as argument to sign() is deprecated, use hash.value instead");
            hash.value = _hex2array(hash.hex);
        }
        if (hash.value && !hash.hex)
            hash.hex = _array2hex(hash.value);

        return _autodetect().then(function(result) {
            // FIXME: dummy security check in website context
            if(location.protocol !== 'https:' && location.protocol !== 'file:') {
                return Promise.reject(new Error(NOT_ALLOWED));
            }
            return _backend.sign(cert, hash, options).then(function(signature) {
                // Add binary value as well
                // TODO: all backends return hex currently
                if (signature.hex && !signature.value)
                    signature.value = _hex2array(signature.hex);
                return signature;
            });
        });
    };
    // Constants for errors
    fields.NO_IMPLEMENTATION = NO_IMPLEMENTATION;
    fields.USER_CANCEL = USER_CANCEL;
    fields.NOT_ALLOWED = NOT_ALLOWED;
    fields.NO_CERTIFICATES = NO_CERTIFICATES;
    fields.TECHNICAL_ERROR = TECHNICAL_ERROR;
    fields.INVALID_ARGUMENT = INVALID_ARGUMENT;
    return fields;
}());
