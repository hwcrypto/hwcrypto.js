import { hasPluginFor, loadPluginFor, _debug } from '../utils'
import * as CONSTANTS from '../constants'
import NotImplementedPlugin from '../NotImplementedPlugin'

const digidoc_mime = 'application/x-digidoc'

function code2str(err) {
    _debug("Error: " + err + " with: " + this.interface.errorMessage)
    switch (parseInt(err)) {
        case 1:  return CONSTANTS.USER_CANCEL
        case 2:  return CONSTANTS.INVALID_ARGUMENT
        case 17: return CONSTANTS.INVALID_ARGUMENT
        case 19: return CONSTANTS.NOT_ALLOWED
        default:
            _debug("Unknown error: " + err + " with: " + this.interface.errorMessage)
            return CONSTANTS.TECHNICAL_ERROR
    }
}

function code2err(err) {
    return new Error(code2str.call(this, err))
}

const certificate_ids = []

class DigiDocPlugin extends NotImplementedPlugin {
    static get _id() { return 'npapi' }

    static isApplicable() {
        _debug("Assuming IE BHO, testing")
        const isMSIE = navigator.userAgent.indexOf("MSIE") !== -1
        const isTrident = navigator.userAgent.indexOf("Trident") !== -1
        return Promise.resolve(isMSIE || isTrident || hasPluginFor(digidoc_mime))
    }

    constructor() {
        super()
        this.interface = loadPluginFor(digidoc_mime) || {}
    }

    get _name() {
        return 'NPAPI/BHO for application/x-digidoc'
    }

    check() {
        return Promise.resolve(typeof this.interface.version !== 'undefined')
    }

    getVersion() {
        return Promise.resolve(this.interface.version)
    }

    getCertificate(options = {}) {
        if (options.lang) {
            this.interface.pluginLanguage = options.lang
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const result = this.interface.getCertificate()
                    if (parseInt(this.interface.errorCode) !== 0) {
                        reject(code2err.call(this, this.interface.errorCode))
                    } else {
                        certificate_ids[result.cert] = result.id
                        resolve({
                            hex: result.cert
                        })
                    }
                } catch (ex) {
                    _debug(JSON.stringify(ex))
                    reject(code2err.call(this, this.interface.errorCode))
                }
            }, 0)
        })
    }

    sign(cert, hash, options = {}) {
        return new Promise((resolve, reject) => {
            const cid = certificate_ids[cert.hex]
            if (cid) {
                setTimeout(() => {
                    try {
                        const language = options.lang || 'en'
                        const signature = this.interface.sign(cid, hash.hex, language)
                        resolve({
                            hex: signature
                        })
                    } catch (ex) {
                        _debug(JSON.stringify(ex))
                        reject(code2err.call(this, this.interface.errorCode))
                    }
                }, 0)
            } else {
                _debug('invalid certificate: ' + JSON.stringify(cert))
                reject(new Error(CONSTANTS.INVALID_ARGUMENT))
            }
        })
    }
}

export default DigiDocPlugin
