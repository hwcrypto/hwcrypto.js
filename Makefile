build:
	bower install

publish:
	test -z "`git status -s`"
	echo "var publishedGitVersion='`git describe --tags --always`';" > gitversion.js
	# check out Github pages if not already
	test -d gh-pages || git clone git@github.com:open-eid/js-token-signing.git -b gh-pages gh-pages
	# make sure it is clean
	(cd gh-pages && git reset --hard && git clean -dfx && git rm -rf *)
	# copy files to be published
	cp --parents bower_components/jquery/dist/jquery.min.js gh-pages
	cp --parents bower_components/jquery/dist/jquery.min.map gh-pages
	cp --parents bower_components/native-promise-only/lib/npo.src.js gh-pages
	cp sign.html gh-pages
	cp hwcrypto.js gh-pages
	cp hex2base.js gh-pages
	cp gitversion.js gh-pages
	# push to github pages
	(cd gh-pages && git add * && git commit --amend -m "publish" && git push -f origin gh-pages)
