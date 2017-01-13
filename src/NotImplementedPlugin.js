import * as CONSTANTS from './constants'

class NotImplementedPlugin {
    static get _id() { throw new Error(CONSTANTS.TECHNICAL_ERROR) }

    static isApplicable() {
        return Promise.resolve(true)
    }

    get _name() {
        return 'No implementation'
    }

    check() { return Promise.resolve(true) }
    getVersion() { return Promise.reject(new Error(CONSTANTS.TECHNICAL_ERROR)) }
    getCertificate() { return Promise.reject(new Error(CONSTANTS.TECHNICAL_ERROR)) }
    auth() { return Promise.reject(new Error(CONSTANTS.TECHNICAL_ERROR)) }
    sign() { return Promise.reject(new Error(CONSTANTS.TECHNICAL_ERROR)) }
}

export default NotImplementedPlugin
