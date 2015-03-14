describe('window.hwcrypto', function() {
	// Do automatic detection.
//	window.hwcrypto.autodetect();

	describe('.getVersion()', function() {
		it('getVersion should always be fulfilled as string that contains a dot', function () {
			this.timeout(0);
			return window.hwcrypto.getVersion().should.eventually.contain('.');
		});
	});

	if (location.protocol === 'http:') {
		describe('.getCertficate()', function() {
			it('should be rejected with "not_allowed" if run from http site', function(){
				return window.hwcrypto.getCertificate().should.be.rejectedWith(Error, "not_allowed");
			});
		});
		describe('.sign()', function () {
			it('should reject invocation with arbitrary parameters with "not_allowed" if run from http site', function() {
				return window.hwcrypto.sign("test", "test").should.be.rejectedWith(Error, "not_allowed");
			});
		});
	} else {
		var chosenOne = null;
		describe('.getCertficate()', function() {
			it('should be rejected with no_certificates if none listed by extension', function() {
				this.timeout(0);
				window.alert('Make sure no card is inserted and press "OK" (Windows) or "Select" in an empty dialog without certificates if asked');
				return window.hwcrypto.getCertificate().should.be.rejectedWith(Error, "no_certificates");
			});			
			it('should be rejected with user_cancel if cancelled by user', function() {
				this.timeout(0);
				window.alert('Insert card and press "cancel" if/when presented with certificate selection dialog');
				return window.hwcrypto.getCertificate().should.be.rejectedWith(Error, "user_cancel");
			});
			it('should be resolved with a certificate', function() {
				this.timeout(0);
				window.alert('Select your certificate and press "OK"');
				return window.hwcrypto.getCertificate().should.be.fulfilled.then(function(result){
					chosenOne = result;
					result.should.have.length.above(200);
				});
			});

		});
		describe('.sign()', function() {
			it('should be rejected with INVALID_ARGUMENT if called with no arguments', function() {
				return window.hwcrypto.sign().should.be.rejectedWith(Error, "invalid_argument");
			});
			it('should be rejected with INVALID_ARGUMENT if called with null/null', function() {
				return window.hwcrypto.sign(null, null).should.be.rejectedWith(Error, "invalid_argument");
			});
		});
	}
}); 

