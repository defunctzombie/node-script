(function(require) {
require.define('./noop', '', function(global, module, exports, require, process, __filename, __dirname) {
/// no content

});

require.define('script/main.double.js', '', function(global, module, exports, require, process, __filename, __dirname) {
// noop should be included in output only once
require('./noop');
require('./noop');

});

})(require);