build:
	bower install

publish:
	# make sure versions are in sync
	grunt sync
	# only publish commited code
	test -z "`git status -s`"
	echo "var publishedGitVersion='`git describe --tags --always`';" > gitversion.js
	# check out Github pages if not already
	test -d gh-pages || git clone git@github.com:open-eid/js-token-signing.git -b gh-pages gh-pages
	# make sure it is clean
	(cd gh-pages && git reset --hard && git clean -dfx && git rm -rf *)
	# make sure all bower components are available
	bower install
	# copy files to be published
	cp -rv bower_components gh-pages
	cp -rv test gh-pages
	cp sign.html gh-pages
	cp hwcrypto.js gh-pages
	cp hex2base.js gh-pages
	cp gitversion.js gh-pages
	# push to github pages
	(cd gh-pages && git add * && git commit --amend -m "publish" && git push -f origin gh-pages)
