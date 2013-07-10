test:
	@NODE_ENV=test ./node_modules/.bin/nodeunit test/**/**

.PHONY: test
