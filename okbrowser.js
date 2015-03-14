describe('window.hwcrypto', function(){
	mocha.ui('bdd');
	var expect = chai.expect;
	var should = chai.should();

	it('should exist after script inclusion', function () {
		expect(window.hwcrypto).to.be.a('object'); 
	});
	it('should not have extra properties', function() {
		var okprops = ["use", "debug", "getCertificate", "sign", "NO_IMPLEMENTATION", "USER_CANCEL", "NOT_ALLOWED", "NO_CERTIFICATES", "TECHNICAL_ERROR", "INVALID_ARGUMENT"].sort();
		var props = Object.keys(window.hwcrypto).sort();
		expect(props).to.have.members(okprops);
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
}); 
