(function(require) {
require.define('./noop', '', function(global, module, exports, require, process, __filename, __dirname) {
/// no content

});

require.define('script/main.single.js', '', function(global, module, exports, require, process, __filename, __dirname) {
/// single require
require('./noop');

});

})(require);
