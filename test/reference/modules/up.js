(function(require) {
require.alias('.././noop', '../noop');
require.define('../noop', '../', function(global, module, exports, require, process, __filename, __dirname) {
/// no content

});

require.define('../single', '../', function(global, module, exports, require, process, __filename, __dirname) {
/// single require
require('./noop');

});

require.define('script/main.up.js', '', function(global, module, exports, require, process, __filename, __dirname) {
/// check loading one level up

/// noop is loaded by single and should appear only once in output
require('../noop');
require('../single');

});

})(require);
