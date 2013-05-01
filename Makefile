
all: node_modules
	@rm -fr three*
	@node build.js

node_modules:
	@npm install

