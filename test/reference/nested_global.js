(function(require) {
require.alias('/modules/mod', '/../node_modules/mod.js');
require.define('/../node_modules/mod.js', '/../node_modules/', function(global, module, exports, require, __filename, __dirname) {

module.exports = function() {
    return 5;
}


});

require.define('/nested_global.js', '/', function(global, module, exports, require, __filename, __dirname) {
// global.js requires something from the global path
require('./modules/global');

});

require.define('/modules/global.js', '/modules/', function(global, module, exports, require, __filename, __dirname) {
// mod is found in a node_modules directory
require('mod');

});

})(require);
