(function(require) {
require.define('/double.js', '/', function(global, module, exports, require, __filename, __dirname) {
// noop should be included in output only once
require('./noop');
require('./noop');

});

require.define('/noop.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// no content

});

})(require);
