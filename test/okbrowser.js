describe('window.hwcrypto', function(){
    var expect = chai.expect;
    var should = chai.should();

    it('should exist after script inclusion', function () {
        expect(window.hwcrypto).to.be.a('object'); 
    });
    it('should not have extra properties', function() {
       var okprops = [
               "length", "name", "prototype",
               "use", "debug", "getCertificate", "sign", "auth", "NO_IMPLEMENTATION", "USER_CANCEL", "NOT_ALLOWED", "NO_CERTIFICATES", "TECHNICAL_ERROR", "INVALID_ARGUMENT"
       ].sort();
       var props = Object.getOwnPropertyNames(window.hwcrypto).sort();
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
        it('should be rejected without backend', function(){
            return window.hwcrypto.getCertificate({}).should.be.rejectedWith(Error, window.hwcrypto.NO_IMPLEMENTATION);
        });
    });
    describe('.sign()', function(){
        it('should be rejected without backend', function(){
            return window.hwcrypto.sign({}, {}, {}).should.be.rejectedWith(Error, window.hwcrypto.NO_IMPLEMENTATION);
        });
    });
    describe('.auth()', function(){
        it('should be rejected without backend', function(){
            return window.hwcrypto.auth({}, {}, {}).should.be.rejectedWith(Error, window.hwcrypto.NO_IMPLEMENTATION);
        });
    });
}); 
