(function(require) {
require.define('/../noop.js', '/../', function(global, module, exports, require, __filename, __dirname) {
/// no content

});

require.define('/up.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// check loading one level up

/// noop is loaded by single and should appear only once in output
require('../noop');
require('../single');

});

require.define('/../single.js', '/../', function(global, module, exports, require, __filename, __dirname) {
/// single require
require('./noop');

});

})(require);
