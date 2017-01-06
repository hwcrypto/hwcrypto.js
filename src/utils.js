import * as CONSTANTS from './constants'

// Returns "true" if a plugin is present for the MIME
function hasPluginFor(mime) {
    return navigator.mimeTypes && mime in navigator.mimeTypes
}
// Checks if a function is present (used for Chrome)
function hasExtensionFor(cls) {
    return typeof window[cls] === 'function'
}
function _debug(x) {
    // console.log(x)
}

function _hex2array(str) {
    if(typeof str == 'string') {
        const len = Math.floor(str.length / 2)
        const ret = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            ret[i] = parseInt(str.substr(i * 2, 2), 16)
        }
        return ret
    }
}

function _array2hex(args) {
    let ret = ""
    for(let i = 0; i < args.length; i++) ret += (args[i] < 16 ? "0" : "") + args[i].toString(16)
    return ret.toLowerCase()
}

function _mimeid(mime) {
    return "hwc" + mime.replace(/[\/-]/g, '')
}

function loadPluginFor(mime) {
    const element = _mimeid(mime)
    if(document.getElementById(element)) {
        _debug("Plugin element already loaded")
        return document.getElementById(element)
    }
    _debug(`Loading plugin for ${ mime } into ${ mime }`)
    // Must insert tag as string (not as an Element object) so that IE9 can access plugin methods
    const objectTag = `<object id="${ element }" type="${ mime }" style="width: 1px; height: 1px; position: absolute; visibility: hidden;"></object>`
    const div = document.createElement("div")
    div.setAttribute("id", 'pluginLocation' + element)
    document.body.appendChild(div)
    // Must not manipulate body's innerHTML directly, otherwise previous Element references get lost
    document.getElementById('pluginLocation' + element).innerHTML = objectTag
    return document.getElementById(element)
}

function jsonXHR(method, url, data, options = {}) {
    const jsonData = data && JSON.stringify(data)

    return new Promise(function(resolve, reject) {
        // Prepare request
        const xhr = new XMLHttpRequest()
        xhr.open(method, url, true)
        xhr.timeout = options.timeout || CONSTANTS.defaultXHRTimeout
        xhr.setRequestHeader('Accept', '*')
        xhr.setRequestHeader('Content-Type', 'application/json')

        // Handle response
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response))
            } else {
                reject(new Error(xhr.statusText))
            }
        }
        xhr.ontimeout = function() {
            reject(new Error('Request timeouted'))
        }
        xhr.onerror = function() {
            reject(new Error('An error occurred in the request'))
        }

        // Perform request
        xhr.send(jsonData)
    })
}

export { hasPluginFor, hasExtensionFor, _debug, _hex2array, _array2hex, loadPluginFor, jsonXHR }
