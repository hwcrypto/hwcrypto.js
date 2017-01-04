import { jsonXHR, _debug } from '../utils'
import * as CONSTANTS from '../constants'
import NotImplementedPlugin from '../NotImplementedPlugin'

const INFINITE_TIMEOUT = {
    timeout: 0
}

class DigiDocSevlet extends NotImplementedPlugin {
    static get _id() { return 'servlet' }

    static isApplicable() {
        return Promise.resolve(true)
    }

    get _name() {
        return 'Pluginless eID interface'
    }

    check() {
        return jsonXHR('POST', CONSTANTS.localServiceURL, {
            op: 'test'
        }, { timeout: 1000 })
        .then(() => true)
        .catch((ex) => {
            _debug(ex)
            return false
        })
    }

    getVersion() {
        return jsonXHR("POST", CONSTANTS.localServiceURL, {
            op: 'getVersion'
        }).then((result) => result.version)
        .catch((ex) => {
            _debug(ex)
            throw new Error(CONSTANTS.TECHNICAL_ERROR)
        })
    }

    getCertificate(options = {}) {
        const data = {
            op: 'getCertificate'
        }
        if (options.lang) {
            data.lang = options.lang
        }

        return jsonXHR('POST', CONSTANTS.localServiceURL, data, INFINITE_TIMEOUT)
        .then((result) => {
            return { hex: result.cert }
        }).catch((ex) => {
            _debug(ex)
            throw new Error(CONSTANTS.TECHNICAL_ERROR)
        })
    }

    sign(cert, hash, options = {}) {
        const data = {
            op: 'sign',
            hashtype: hash.type,
            hash: hash.hex,
            cert: cert.hex
        }
        if (options.lang) {
            data.lang = options.lang
        }

        return jsonXHR('POST', CONSTANTS.localServiceURL, data, INFINITE_TIMEOUT)
        .then((result) => {
            return { hex: result.signature }
        }).catch((ex) => {
            _debug(ex)
            throw new Error(CONSTANTS.TECHNICAL_ERROR)
        })
    }
}

export default DigiDocSevlet
