(function(require) {
require.define('./modules/global', 'modules/', function(global, module, exports, require, process, __filename, __dirname) {
// mod is found in a node_modules directory
require('mod');

});

require.define('mod', '../node_modules/', function(global, module, exports, require, process, __filename, __dirname) {

module.exports = function() {
    return 5;
}


});

require.define('script/main.nested_global.js', '', function(global, module, exports, require, process, __filename, __dirname) {
// global.js requires something from the global path
require('./modules/global');

});

})(require);
