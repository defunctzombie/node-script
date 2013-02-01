// mod is found in a node_modules directory
var mod = require('mod');
assert.equal(mod, 5);

module.exports = 'foobar';
