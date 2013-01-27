(function(require) {
require.define('/noop.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// no content

});

require.define('/single.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// single require
require('./noop');

});

})(require);
