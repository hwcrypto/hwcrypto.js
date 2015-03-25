/* jshint expr: true */
describe('window.hwcrypto', function(){
	mocha.ui('bdd');
    var expect = chai.expect;
    var should = chai.should();

	it('should exist after script inclusion', function () {
		expect(window.hwcrypto).to.be.a('object'); 
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
		var okprops = ["use", "debug", "getCertificate", "sign", "NO_IMPLEMENTATION", "USER_CANCEL", "NOT_ALLOWED", "NO_CERTIFICATES", "TECHNICAL_ERROR", "INVALID_ARGUMENT"].sort();
		var props = Object.keys(window.hwcrypto).sort();
		expect(props).to.have.members(okprops);
	});
	describe('backend selection', function() {
		it('should have use() method', function() {
			expect(window.hwcrypto).itself.to.respondTo('use');
		});
		it('use() method should always return true with auto argument', function() {
			expect(window.hwcrypto.use('auto')).to.be.true;
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
		it('should be rejected with no arguments', function(){
			return window.hwcrypto.getCertificate().should.be.rejectedWith(Error, window.hwcrypto.INVALID_ARGUMENT);
		});
		it('should be rejected without backend', function(){
			return window.hwcrypto.getCertificate({}).should.be.rejectedWith(Error, window.hwcrypto.NO_IMPLEMENTATION);
		});
	});
	describe('.sign()', function(){
		it('should be rejected with no arguments', function(){
			return window.hwcrypto.sign().should.be.rejectedWith(Error, window.hwcrypto.INVALID_ARGUMENT);
		});
		it('should be rejected without backend', function(){
			return window.hwcrypto.sign({}, {type: "SHA-1", hex: "3132"}, {}).should.be.rejectedWith(Error, window.hwcrypto.NO_IMPLEMENTATION);
		});
	});
}); 

