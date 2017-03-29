# comprende

> A vue.js-based interface to use a MediaWiki/Wikibase installation as a question/quiz service


## Build Setup

Install MediaWiki HEAD
Install WikiBase HEAD
Checkout comprende repo
Symlink index.html and dist/build.js from MediaWiki root directory

(
On tools labs:
Install n from repo via https://github.com/tj/n
Add n/bin path to .profile
)

cd comprende
npm init -y
npm install --save-dev webpack
npm install --save-dev vue
npm install --save-dev webpack-config-vue //???
npm install --save-dev vue-cli (see https://github.com/vuejs-templates/webpack-simple)
npm install --save-dev vue-router
cd .. ; comprende/node_modules/.bin/vue init webpack-simple comprende
cd comprende ; npm install
node_modules/.bin/webpack -w


For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
