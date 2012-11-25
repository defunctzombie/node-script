(function(require) {
require.alias('/modules/mod', '/../node_modules/mod');
require.define('/../node_modules/mod', '/../node_modules/', function(global, module, exports, require, process, __filename, __dirname) {

module.exports = function() {
    return 5;
}


});

require.define('/modules/global', '/modules/', function(global, module, exports, require, process, __filename, __dirname) {
// mod is found in a node_modules directory
require('mod');

});

require.define('/nested_global', '/', function(global, module, exports, require, process, __filename, __dirname) {
// global.js requires something from the global path
require('./modules/global');

});

})(require);
