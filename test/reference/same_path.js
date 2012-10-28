(function(require) {
require.define('./modules', 'modules/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('modules/./same_name', 'modules/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'foo';

});

require.define('./others', 'others/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('others/./same_name', 'others/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'bar';

});

require.define('script/main.same_path.js', '', function(global, module, exports, require, process, __filename, __dirname) {
require('./modules');
require('./others');

});

})(require);
