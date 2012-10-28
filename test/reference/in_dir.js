(function(require) {
require.define('./modules/sample', 'modules/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = function() {
}

});

require.define('script/main.in_dir.js', '', function(global, module, exports, require, process, __filename, __dirname) {
/// make sure loading from inside a directory works
require('./modules/sample');

});

})(require);
