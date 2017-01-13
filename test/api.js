/* jshint expr: true */
var _data = {
        id: 1,
        hex: "30313233343536373839",
        encoded: new Uint8Array([48, 49, 50, 51, 52, 53, 54, 55, 56, 57])
    };

describe('window.hwcrypto', function(){
    var expect = chai.expect;
    var should = chai.should();
    it('should exist after script inclusion', function () {
        expect(window.hwcrypto).to.be.a('function'); 
    });
    it('should not have a version property', function() {
        expect(window.hwcrypto).not.have.a.property('version');
    });
    it('should not have a getVersion() method', function() {
        expect(window.hwcrypto).itself.not.to.respondTo('getVersion');
    });
    it('should have a getCertificate() method', function() {
        expect(window.hwcrypto).itself.to.respondTo('getCertificate');
    });
    it('should have a sign() method', function() {
        expect(window.hwcrypto).itself.to.respondTo('sign');
    });
    it('should have a auth() method', function() {
        expect(window.hwcrypto).itself.to.respondTo('auth');
    });
    it('should have NO_IMPLEMENTATION constant', function() {
        expect(window.hwcrypto.NO_IMPLEMENTATION).to.equal('no_implementation');
    });
    it('should have INVALID_ARGUMENT constant', function() {
        expect(window.hwcrypto.INVALID_ARGUMENT).to.equal('invalid_argument');
    });
    it('should have NO_CERTIFICATES constant', function() {
        expect(window.hwcrypto.NO_CERTIFICATES).to.equal('no_certificates');
    });
    it('should have NOT_ALLOWED constant', function() {
        expect(window.hwcrypto.NOT_ALLOWED).to.equal('not_allowed');
    });
    it('should have USER_CANCEL constant', function() {
        expect(window.hwcrypto.USER_CANCEL).to.equal('user_cancel');
    });
    it('should have TECHNICAL_ERROR constant', function() {
        expect(window.hwcrypto.TECHNICAL_ERROR).to.equal('technical_error');
    });
    it('should not have extra properties', function() {
        var okprops = [
            // Node.js default properties
            "length", "name", "prototype", "arguments", "callee", "caller",
            // Proprietary properties
            "use", "debug", "getCertificate", "sign", "auth", "NO_IMPLEMENTATION", "USER_CANCEL", "NOT_ALLOWED", "NO_CERTIFICATES", "TECHNICAL_ERROR", "INVALID_ARGUMENT"
        ].sort();
        var props = Object.getOwnPropertyNames(window.hwcrypto).sort();
        expect(props).to.have.members(okprops);
    });
    describe('backend selection', function() {
        it('should have use() method', function() {
            expect(window.hwcrypto).itself.to.respondTo('use');
        });
        it('use() method should always return true with auto argument', function() {
            return window.hwcrypto.use('auto').should.eventually.be.true;
        });
    });

    describe('debugging capabilities', function(){
        it('should have debug() method', function() {
            expect(window.hwcrypto).itself.to.respondTo('debug');
        });
        it('should always succeed', function() {
            return window.hwcrypto.debug().should.eventually.be.a('string');
        });
        it('should always contain "hwcrypto"', function() {
            return window.hwcrypto.debug().should.eventually.contain('hwcrypto');
        });
    });

    describe('.getCertificate()', function(){
        it('should be rejected with not an object argument', function(){
            return window.hwcrypto.getCertificate(null).should.be.rejectedWith(Error, window.hwcrypto.INVALID_ARGUMENT);
        });
        it('should be rejected without backend', function(){
            return window.hwcrypto.getCertificate({}).should.be.rejectedWith(Error, window.hwcrypto.TECHNICAL_ERROR);
        });
    });
    describe('.sign()', function(){
        it('should be rejected with no arguments', function(){
            return window.hwcrypto.sign().should.be.rejectedWith(Error, window.hwcrypto.INVALID_ARGUMENT);
        });
        it('should be rejected without backend', function(){
            // Prepare
            return hwcrypto.use('non-existing')
            // Test
            .then(function () {
                return window.hwcrypto.sign({}, {type: "SHA-1", hex: "3132"});
            })
            // Verify
            .should.be.rejectedWith(Error, window.hwcrypto.TECHNICAL_ERROR);
        });
    });
    describe('.auth()', function(){
        it('should be rejected with technical error', function(){
            var cert = {};
            var hash = {
                type: 'SHA-1',
                hex: '30313233343536373839'
            };
            return window.hwcrypto.auth(cert, hash).should.be.rejectedWith(Error, window.hwcrypto.TECHNICAL_ERROR);
        });
    });

    describe('Backends', function() {
        [DigiDocPluginMock, DigiDocExtensionMock].forEach(function(Backend) {
            describe(Backend._name, function() {
                var backend;
                beforeEach(function () {
                    backend = Backend.attach();
                    if (Backend === DigiDocPluginMock) {
                        backend._version = '3.2.1';
                    }
                });
                afterEach(function() {
                    backend.detach();
                    delete backend;
                });

                it('should be findable with .use(\'auto\')', function() {
                    return hwcrypto.use('auto').should.eventually.be.true;
                });
                it('should be findable with .use(\'' + Backend._id + '\')', function() {
                    return hwcrypto.use(Backend._id).should.eventually.be.true;
                });
                it('should return correct .debug() info', function() {
                    // Prepare
                    backend._version = '1.2.3';
                    return hwcrypto.use(Backend._id)
                    // Test
                    .then(function () {
                        return hwcrypto.debug()
                    })
                    // Verify
                    .should.eventually.equal('hwcrypto.js <!-- @@hwcryptoversion --> with ' + Backend._interface_name + ' ' + backend._version);
                });

                describe('.getCertificate(...) method', function () {
                    it('should retrieve a certificate successfully', function () {
                        // Prepare
                        return hwcrypto.use(Backend._id).then(function (backendFound) {
                            if (Backend === DigiDocPluginMock) {
                                backend._errorCode = 0;
                                backend._certificateResponse = { id: _data.id, cert: _data.hex };
                            } else {
                                backend._certificateResponse = { id: _data.id, hex: _data.hex };
                            }
                        })
                        // Test
                        .then(function () {
                            return hwcrypto.getCertificate();
                        })
                        // Verify
                        .then(function (result) {
                            result.should.have.property('hex').and.equal(_data.hex);
                            result.should.have.property('encoded').and.eql(_data.encoded);
                        });
                    });
                    if (Backend == DigiDocPluginMock) {
                        [2, 17].forEach(function (code) { // INVALID_ARGUMENT codes
                            it('should be rejected with \'' + window.hwcrypto.INVALID_ARGUMENT + '\' (' + code + ') when invalid language', function () {
                                // Prepare
                                return hwcrypto.use(Backend._id).then(function () {
                                    backend._errorCode = code;
                                    backend._certificateResponse = {};
                                })
                                // Test
                                .then(function () {
                                    return hwcrypto.getCertificate({lang: 'fr'});
                                })
                                // Verify
                                .should.eventually.be.rejectedWith(window.hwcrypto.INVALID_ARGUMENT);
                            });
                        });
                    } else {
                        it('should be rejected with \'' + window.hwcrypto.INVALID_ARGUMENT + '\' when invalid language', function () {
                            // Prepare
                            return hwcrypto.use(Backend._id).then(function () {
                                backend._certificateResponse = new Error(window.hwcrypto.INVALID_ARGUMENT)
                            })
                            // Test
                            .then(function () {
                                return hwcrypto.getCertificate({lang: 'fr'});
                            })
                            // Verify
                            .should.eventually.be.rejectedWith(window.hwcrypto.INVALID_ARGUMENT);
                        });
                    }
                    it('should be rejected with \'' + window.hwcrypto.NOT_ALLOWED + '\' when accessed from not https', function () {
                        // Prepare
                        return hwcrypto.use(Backend._id).then(function (backendFound) {
                            if (Backend === DigiDocPluginMock) {
                                backend._errorCode = 19; // NOT_ALLOWED
                                backend._certificateResponse = { id: _data.id, cert: _data.hex };
                            } else {
                                backend._certificateResponse = new Error(window.hwcrypto.NOT_ALLOWED)
                            }
                        })
                        // Test
                        .then(function (argument) {
                            return hwcrypto.getCertificate();
                        }) 
                        // Verify
                        .should.eventually.be.rejectedWith(window.hwcrypto.NOT_ALLOWED);
                    });
                });

                describe('.sign(...) method', function () {
                    it('should perform signing successfully', function () {
                        // Prepare
                        return hwcrypto.use(Backend._id).then(function (backendFound) {
                            backend._errorCode = 0;
                            backend._certificateResponse = { id: _data.id, cert: _data.hex };
                            return hwcrypto.getCertificate();
                        }).then(function () {
                            if (Backend === DigiDocPluginMock) {
                                backend._signatureResponse = _data.hex;
                                backend._errorCode = 0;
                            } else {
                                backend._signatureResponse = {hex: _data.hex}
                            }
                        })
                        // Test
                        .then(function () {
                            return hwcrypto.sign({hex: _data.hex}, {type: "SHA-1", hex: "3132"})
                        })
                        // Verify
                        .then(function (result) {
                            result.should.have.property('hex').and.equal(_data.hex);
                            result.should.have.property('value').and.eql(_data.encoded);
                        });
                    });
                    it('should be rejected with \'' + window.hwcrypto.USER_CANCEL + '\'', function () {
                        // Prepare
                        return hwcrypto.use(Backend._id).then(function (backendFound) {
                            if (Backend === DigiDocPluginMock) {
                                backend._errorCode = 0;
                            }
                            backend._certificateResponse = { id: _data.id, cert: _data.hex };
                            return hwcrypto.getCertificate();
                        }).then(function () {
                            if (Backend === DigiDocPluginMock) {
                                backend._signatureResponse = new Error();
                                backend._errorCode = 1; // USER_CANCEL
                            } else {
                                backend._signatureResponse = new Error(window.hwcrypto.USER_CANCEL)
                            }
                        })
                        // Test
                        .then(function () {
                            return hwcrypto.sign({hex: _data.hex}, {type: "SHA-1", hex: "3132"})
                        })
                        // Verify
                        .should.eventually.be.rejectedWith(window.hwcrypto.USER_CANCEL);
                    });
                    if (Backend === DigiDocPluginMock) {
                        [2, 17].forEach(function (code) { // INVALID_ARGUMENT codes
                            it('should be rejected with \'' + window.hwcrypto.INVALID_ARGUMENT + '\' (' + code + ') when invalid language', function () {
                                // Prepare
                                return hwcrypto.use(Backend._id).then(function (backendFound) {
                                    backend._errorCode = 0;
                                    backend._certificateResponse = { id: _data.id, cert: _data.hex };
                                    return hwcrypto.getCertificate();
                                }).then(function () {
                                    backend._signatureResponse = new Error();
                                    backend._errorCode = code;
                                })
                                // Test
                                .then(function () {
                                    return hwcrypto.sign({hex: _data.hex}, {type: "SHA-1", hex: "3132"})
                                })
                                // Verify
                                .should.eventually.be.rejectedWith(window.hwcrypto.INVALID_ARGUMENT);
                            });
                        });
                    } else {
                        it('should be rejected with \'' + window.hwcrypto.INVALID_ARGUMENT + '\' when invalid language', function () {
                            // Prepare
                            return hwcrypto.use(Backend._id).then(function (backendFound) {
                                backend._certificateResponse = { id: _data.id, cert: _data.hex };
                                return hwcrypto.getCertificate();
                            }).then(function () {
                                backend._signatureResponse = new Error(window.hwcrypto.INVALID_ARGUMENT)
                            })
                            // Test
                            .then(function () {
                                return hwcrypto.sign({hex: _data.hex}, {type: "SHA-1", hex: "3132"})
                            })
                            // Verify
                            .should.eventually.be.rejectedWith(window.hwcrypto.INVALID_ARGUMENT);
                        });
                    }
                    it('should be rejected with \'' + window.hwcrypto.NOT_ALLOWED + '\' when accessed from not https', function () {
                        // Prepare
                        return hwcrypto.use(Backend._id).then(function (backendFound) {
                            if (Backend === DigiDocPluginMock) {
                                backend._errorCode = 0;
                                backend._certificateResponse = { id: _data.id, cert: _data.hex };
                            } else {
                                backend._certificateResponse = new Error(window.hwcrypto.NOT_ALLOWED)
                            }
                            return hwcrypto.getCertificate();
                        }).then(function () {
                            backend._signatureResponse = new Error();
                            backend._errorCode = 19; // NOT_ALLOWED
                        })
                        // Test
                        .then(function () {
                            return hwcrypto.sign({hex: _data.hex}, {type: "SHA-1", hex: "3132"})
                        })
                        // Verify
                        .should.eventually.be.rejectedWith(window.hwcrypto.NOT_ALLOWED);
                    });
                });
            });
        });
    });
});
