describe('window.hwcrypto', function(){
	var expect = chai.expect;
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

	describe('backend selection', function() {
		it('should have use() method', function() {
			expect(window.hwcrypto).itself.to.respondTo('use');
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

