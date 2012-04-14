require.alias('./noop', '../noop');
require.register('../noop', function(module, exports, require, __filename, __dirname) {
/// no content
});

require.register('../single', function(module, exports, require, __filename, __dirname) {
/// single require

var noop = require('./noop');
});

require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// check loading one level up

/// noop is loaded by single and should appear only once in output
var noop = require('../noop');
var single = require('../single');
});
require('__entry__');
