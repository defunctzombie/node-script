require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// check that noop only gets loaded once
/// single will require noop again

var noop = require('./noop');
var single = require('./single');

module.exports = function() { };
});

require.register('./noop', function(module, exports, require, __filename, __dirname) {
/// no content
});

require.register('./single', function(module, exports, require, __filename, __dirname) {
/// single require

var noop = require('./noop');
});

