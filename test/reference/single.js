(function(require) {
require.define('/noop', '/', function(global, module, exports, require, process, __filename, __dirname) {
/// no content

});

require.define('/single', '/', function(global, module, exports, require, process, __filename, __dirname) {
/// single require
require('./noop');

});

})(require);
