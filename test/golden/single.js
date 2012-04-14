require.register('./noop', function(module, exports, require, __filename, __dirname) {
/// no content
});
require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// single require

var noop = require('./noop');
});
require('__entry__');
