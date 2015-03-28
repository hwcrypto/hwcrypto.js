buildit:
	npm install
	bower install
	grunt

publish:
	# make sure versions are in sync
	grunt sync
	# only publish commited code
	test -z "`git status -s`"
	# check out Github pages if not already
	test -d gh-pages || git clone git@github.com:open-eid/hwcrypto.js.git -b gh-pages gh-pages
	# make sure it is clean
	(cd gh-pages && git reset --hard && git clean -dfx && git rm -rf *)
	# run Grunt (includes tests)
	grunt
	# Have Git version available in a JS file
	echo "var publishedGitVersion='`git describe --tags --always`';" > dist/gitversion.js
	# copy built pages
	mv dist/* gh-pages
	# push to github pages
	(cd gh-pages && git add * && git commit --amend -m "publish" && git push -f origin gh-pages)
