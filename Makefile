build/MyCard.js: ./node_modules ./build
	npx swc ./src/MyCard.ts -o ./build/MyCard.js

./build:
	mkdir -p ./build

./node_modules:
	npm install

serve: ./build/MyCard.js
	npx serve

clean:
	rm -rf ./build ./node_modules

.PHONY: clean serve