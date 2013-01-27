(function(require) {
require.define('/modules/sample.js', '/modules/', function(global, module, exports, require, __filename, __dirname) {
module.exports = function() {
}

});

require.define('/in_dir.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// make sure loading from inside a directory works
require('./modules/sample');

});

})(require);
