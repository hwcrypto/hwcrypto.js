default: bower_components
	grunt

node_modules:
	npm install

bower_components: node_modules
	bower install

publish: bower_components
	grunt publish
	# only publish commited code
	test -z "`git status -s`" || echo "Must manually commit any generated code for Bower or Github releases"
