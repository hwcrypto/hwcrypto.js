/*global window navigator*/
import NotImplementedPlugin from '../NotImplementedPlugin'
import { hasExtensionFor } from '../utils'

const digidoc_chrome = 'TokenSigning'

class DigiDocExtension extends NotImplementedPlugin {
    static get _id() { return 'chrome' }

    static isApplicable() {
        const isChrome = navigator.userAgent.indexOf("Chrome") != -1
        return Promise.resolve(isChrome && hasExtensionFor(digidoc_chrome))
    }

    constructor() {
        super()
        this.interface = null
    }

    get _name() {
        return 'Chrome native messaging extension'
    }

    check() {
        const extensionFound =
            hasExtensionFor(digidoc_chrome)
            && !!(this.interface = new window[digidoc_chrome]())
        return Promise.resolve(extensionFound)
    }

    getVersion() {
        return this.interface.getVersion(...arguments)
    }

    getCertificate() {
        return this.interface.getCertificate(...arguments)
    }

    sign() {
        return this.interface.sign(...arguments)
    }
}

export default DigiDocExtension
