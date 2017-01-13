function DigiDocPluginMock() {
    var DigiDocPluginObject = document.createElement('object');
    DigiDocPluginObject.id = 'hwc' + 'applicationxdigidoc';
    ['errorCode', 'pluginLanguage', 'version'].forEach(function(prop) {
        Object.defineProperty(
            DigiDocPluginObject,
            prop,
            {
                enumerable: true,
                configurable: true,
                get: function() {
                    if (this['_' + prop] === undefined) {
                        throw new Error('Not implemented');
                    }
                    return this['_' + prop];
                },
                set: function(value) {
                    this['_' + prop] = value;
                }
            }
        );
    });
    function _getResponse(propName) {
        if (this['_' + propName] === undefined) {
            throw new Error('Not implemented');
        }
        if (this['_' + propName] instanceof Error) {
            throw this['_' + propName];
        }
        return this['_' + propName];
    }
    DigiDocPluginObject.getCertificate = function () {
        return _getResponse.apply(this, ['certificateResponse'].concat(arguments));
    };
    DigiDocPluginObject.sign = function () {
        return _getResponse.apply(this, ['signatureResponse'].concat(arguments));
    };
    DigiDocPluginObject.detach = function() {
        detachAll();
    };
    return DigiDocPluginObject;
};
DigiDocPluginMock._id = 'npapi';
DigiDocPluginMock._name = 'DigiDocPlugin';
DigiDocPluginMock._interface_name = 'NPAPI/BHO for application/x-digidoc';
DigiDocPluginMock.attach = function() {
    detachAll();
    var backend = new DigiDocPluginMock()
    document.body.appendChild(backend);
    return document.getElementById(backend.id);
};

function DigiDocExtensionMock() {}
function _getResponse(propName) {
    if (!DigiDocExtensionMock['_' + propName]) {
        return Promise.reject(new Error('Not implemented'));
    }
    if (DigiDocExtensionMock['_' + propName] instanceof Error) {
        return Promise.reject(DigiDocExtensionMock['_' + propName]);
    }
    return Promise.resolve(DigiDocExtensionMock['_' + propName]);
};
DigiDocExtensionMock.prototype.getVersion = function() {
    return _getResponse.apply(this, ['version'].concat(arguments))
};
DigiDocExtensionMock.prototype.getCertificate = function() {
    return _getResponse.apply(this, ['certificateResponse'].concat(arguments))
};
DigiDocExtensionMock.prototype.sign = function() {
    return _getResponse.apply(this, ['signatureResponse'].concat(arguments))
};
DigiDocExtensionMock._id = 'chrome';
DigiDocExtensionMock._name = 'DigiDocExtension';
DigiDocExtensionMock._interface_name = 'Chrome native messaging extension';
DigiDocExtensionMock.attach = function() {
    detachAll();
    return window['TokenSigning'] = DigiDocExtensionMock;
};
DigiDocExtensionMock.detach = function() {
    detachAll();
};

function detachAll() {
    delete window['TokenSigning'];
    var elem = document.getElementById('pluginLocation' + 'hwc' + 'applicationxdigidoc');
    if (elem) {
        elem.innerHTML = '';
    }
}
