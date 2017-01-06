'use strict'

// JavaScript library as described in
// https://github.com/open-eid/hwcrypto.js
import { _debug, _array2hex, _hex2array, hasExtensionFor, hasPluginFor } from './utils'
import * as CONSTANTS from './constants'
import { enabledBackends } from './interfaces'
import NoBackend from './NotImplementedPlugin'

let _backend = null

function _testAndUse(Backend) {
    const backend = new Backend()
    return backend.check().then(function(isLoaded) {
        if (isLoaded) {
            _debug("Using backend: " + backend._name)
            _backend = backend
            return true
        } else {
            _debug(backend._name + " check() failed")
            return false
        }
    })
}

function _autodetect(force) {
    _debug("Autodetecting best backend")
    if (_backend !== null && !force) {
        return Promise.resolve(true)
    }

    function tryToApplyPlugin() {
        return enabledBackends.reduce(function(promise, Plugin) {
            return promise.then(function(result) {
                if (result) {
                    return result
                } else {
                    return _testAndUse(Plugin)
                }
            })
        }, Promise.resolve(false))
    }
    function orUsePlaceholder(pluginFound) {
        if (!pluginFound) {
            return _testAndUse(NoBackend)
        }
    }

    return tryToApplyPlugin().then(orUsePlaceholder)
}

function _performCrypto(method, cert, hash, options = {}) {
    if (arguments.length < 3) {
        return Promise.reject(new Error(CONSTANTS.INVALID_ARGUMENT))
    }
    options.lang = (options && options.lang) || 'en'

    if (!hash || !hash.type || ( !hash.value && !hash.hex )) {
        return Promise.reject(new Error(CONSTANTS.INVALID_ARGUMENT))
    }

    if (hash.hex && !hash.value) {
        _debug(`DEPRECATED: hash.hex as argument to ${ method }() is deprecated, use hash.value instead`)
        hash.value = _hex2array(hash.hex)
    }
    if (hash.value && !hash.hex) {
        hash.hex = _array2hex(hash.value)
    }

    return _autodetect().then(function(result) {
        if (location.protocol !== "https:" && location.protocol !== "file:") {
            return Promise.reject(new Error(CONSTANTS.NOT_ALLOWED))
        }
        return _backend[method](cert, hash, options).then(function(signature) {
            if (signature.hex && !signature.value) {
                signature.value = _hex2array(signature.hex)
            }
            return signature
        })
    })
}

class hwcrypto {
    static use(backend) {
        function tryToFindAndUsePlugin() {
            return enabledBackends.reduce(function(promise, Plugin) {
                return promise.then(function(result) {
                    if (!result && Plugin._id === backend) {
                        return _testAndUse(Plugin)
                    } else {
                        return false
                    }
                })
            }, Promise.resolve(false))
        }
        function orUsePlaceholder(pluginFound) {
            if (!pluginFound) {
                return _testAndUse(NoBackend)
            }
        }

        switch (backend) {
            case undefined:
            case 'auto':
                return _autodetect()
            default:
                return tryToFindAndUsePlugin().then(orUsePlaceholder)
        }
    }

    static debug() {
        const hwversion = `hwcrypto.js ${ CONSTANTS.VERSION }`
        return _autodetect().then(function(result) {
            return _backend.getVersion().then((version) => {
                return hwversion + ' with ' + _backend._name + ' ' + version
            }, (error) => {
                return hwversion + ' with failing backend ' + _backend._name
            })
        })
    }

    static getCertificate(options = {}) {
        if (options == undefined || typeof options !== 'object') {
            _debug("getCertificate options parameter must be an object")
            return Promise.reject(new Error(CONSTANTS.INVALID_ARGUMENT))
        }
        // If options does not specify a language, set to 'en'
        options.lang = (options && options.lang) || 'en'

        return _autodetect().then(function(result) {
            // FIXME: dummy security check in website context
            if (location.protocol !== 'https:' && location.protocol !== 'file:') {
                return Promise.reject(new Error(CONSTANTS.NOT_ALLOWED))
            }

            return _backend.getCertificate(options).then((certificate) => {
                // Add binary value as well
                if (certificate.hex && !certificate.encoded) {
                    certificate.encoded = _hex2array(certificate.hex)
                }
                return certificate
            })
        })
    }

    static sign(cert, hash, options = {}) {
        const args = ['sign'].concat(...arguments)
        return _performCrypto(...args)
    }

    static auth(cert, hash, options = {}) {
        const args = ['auth'].concat(...arguments)
        return _performCrypto(...args)
    }

    // Pass constants in ES6 way
    static get NO_IMPLEMENTATION()  { return CONSTANTS.NO_IMPLEMENTATION }
    static get USER_CANCEL()        { return CONSTANTS.USER_CANCEL }
    static get NOT_ALLOWED()        { return CONSTANTS.NOT_ALLOWED }
    static get NO_CERTIFICATES()    { return CONSTANTS.NO_CERTIFICATES }
    static get TECHNICAL_ERROR()    { return CONSTANTS.TECHNICAL_ERROR }
    static get INVALID_ARGUMENT()   { return CONSTANTS.INVALID_ARGUMENT }
}


_debug('hwcrypto.js activated')

// Fix up IE8
window.addEventListener = window.addEventListener || window.attachEvent

// Probe all existing backends in a failsafe manner.
function probe() {
    const msg = 'probe() detected '
    // First try Chrome extensions
    if (hasExtensionFor(CONSTANTS.digidoc_chrome)) {
        _debug(msg + CONSTANTS.digidoc_chrome)
    }
    if (hasPluginFor(CONSTANTS.digidoc_mime)) {
        _debug(msg + CONSTANTS.digidoc_mime)
    }
}

// There's a timeout because chrome content script needs to be loaded
window.addEventListener('load', () => probe())

// `export default hwcrypto` cannot be used here as ES6 `export default`
// is equivalent to `module.exports.default`
module.exports = hwcrypto
