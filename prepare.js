const isCI = require('is-ci');
const husky = require('husky');

if (!isCI) {
	husky.install('.husky');
}
