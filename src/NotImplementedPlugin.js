import * as CONSTANTS from './constants'

class NotImplementedPlugin {
    static get _id() { throw new Error(CONSTANTS.NO_IMPLEMENTATION) }

    static isApplicable() {
        return Promise.resolve(true)
    }

    get _name() {
        return 'No implementation'
    }

    check() { return Promise.resolve(true) }
    getVersion() { return Promise.reject(new Error(CONSTANTS.NO_IMPLEMENTATION)) }
    getCertificate() { return Promise.reject(new Error(CONSTANTS.NO_IMPLEMENTATION)) }
    auth() { return Promise.reject(new Error(CONSTANTS.NO_IMPLEMENTATION)) }
    sign() { return Promise.reject(new Error(CONSTANTS.NO_IMPLEMENTATION)) }
}

export default NotImplementedPlugin
