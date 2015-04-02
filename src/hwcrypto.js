// JavaScript library as described in
// https://github.com/open-eid/hwcrypto.js
var hwcrypto = (function hwcrypto() {
    'use strict';
    console.log("hwcrypto.js activated");
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
            var ret = new Uint8Array(Math.floor(str.length / 2));
            var i = 0;
            str.replace(/(..)/g, function(str) {
                ret[i++] = parseInt(str, 16);
            });
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
                console.log("Plugin element already loaded");
                return document.getElementById(element);
            }
            console.log('Loading plugin for ' + mime + ' into ' + element);
            var d = document.createElement("object");
            d.setAttribute("id", element);
            d.setAttribute("type", mime);
            d.setAttribute("width", "1");
            d.setAttribute("height", "1");
            document.body.appendChild(d);
            return d;
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
                console.log(msg + digidoc_chrome);
            }
            if(hasPluginFor(digidoc_mime)) {
                console.log(msg + digidoc_mime);
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
                console.log("Error: " + err + " with: " + p.errorMessage);
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
                        console.log("Unknown error: " + err + " with: " + p.errorMessage);
                        return TECHNICAL_ERROR;
                }
            }

            function code2err(err) {
                return new Error(code2str(err));
            }
            this.check = function() {
                if(typeof p.version !== 'undefined') {
                    return true;
                }
                return false;
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
                        console.log(ex);
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
                            console.log(JSON.stringify(ex));
                            reject(code2err(p.errorCode));
                        }
                    } else {
                        console.log("invalid certificate: " + cert);
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
            if(!hasExtensionFor(digidoc_chrome)) return false;
            // FIXME: remove this from content script!
            p = new window[digidoc_chrome]();
            if(p) {
                return true;
            } else {
                return false;
            }
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
            return true;
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
        var b = new Backend();
        if(b.check()) {
            console.log("Using backend: " + Backend.name);
            _backend = b;
            return true;
        } else {
            console.log(Backend.name + " check() failed");
            return false;
        }
    }

    function _autodetect() {
        console.log("Autodetecting best backend");
        // MSIE
        if(navigator.userAgent.indexOf('MSIE') != -1 || navigator.userAgent.indexOf('Trident') != -1) {
            console.log("Assuming IE BHO, testing");
            if (_testAndUse(DigiDocPlugin)) return true;
        }
        // First try Chrome extensions
        if(navigator.userAgent.indexOf('Chrome') != -1 && hasExtensionFor(digidoc_chrome)) {
            if(_testAndUse(DigiDocExtension)) return true;
        }
        if(hasPluginFor(digidoc_mime)) {
            if(_testAndUse(DigiDocPlugin)) return true;
        }
        return _testAndUse(NoBackend);
    }
    // Use a specific backend or autodetect
    fields.use = function(backend) {
        if(typeof backend === undefined || backend === 'auto') {
            return _autodetect();
        } else {
            if(backend === "chrome") {
                return _testAndUse(DigiDocExtension);
            } else if(backend === "npapi") {
                return _testAndUse(DigiDocPlugin);
            } else {
                return false; // unknown backend
            }
        }
    };
    // Give debugging information.
    fields.debug = function() {
        return new Promise(function(resolve, reject) {
            var hwversion = "hwcrypto.js @@hwcryptoversion";
            if(!_backend) _autodetect();
            _backend.getVersion().then(function(version) {
                resolve(hwversion + " with " + _backend._name + " " + version);
            }, function(error) {
                resolve(hwversion + " with failing backend " + _backend._name);
            });
        });
    };
	// Check for available backend
    fields.hasBackend = function() {
        return new Promise(function(resolve, reject) {
            var hwversion = "hwcrypto.js @@hwcryptoversion";
            if(!_backend) _autodetect();
            _backend.getVersion().then(function(version) {
                resolve(hwversion + " with " + _backend._name + " " + version);
            }, function(error) {
                reject(new Error(NO_IMPLEMENTATION));
            });
        });
    };
    // Get a certificate
    fields.getCertificate = function(options) {
        if(typeof options !== 'object') {
            console.log("getCertificate options parameter must be an object");
            return Promise.reject(new Error(INVALID_ARGUMENT));
        }
        // If options does not specify a language, set to 'en'
        if(options && !options.lang) {
            options.lang = 'en';
        }
        if(!_backend) {
            _autodetect();
        }
        // FIXME: dummy security check in website context
        if(location.protocol !== 'https:' && location.protocol !== 'file:') {
            return Promise.reject(new Error(NOT_ALLOWED));
        }
        return _backend.getCertificate(options).then(function(certificate) {
            // Add binary value as well
            if (certificate.hex && !certificate.encoded)
                certificate.encoded = _hex2array(certificate.hex);
            return certificate;
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
            console.log("DEPRECATED: hash.hex as argument to sign() is deprecated, use hash.value instead");
            hash.value = _hex2array(hash.hex);
        }
        if (hash.value && !hash.hex)
            hash.hex = _array2hex(hash.value);

        if(!_backend) {
            _autodetect();
        }
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
