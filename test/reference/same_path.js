(function(require) {
require.alias('/modules', '/modules/index');
require.alias('/others', '/others/index');
require.define('/modules/same_name', '/modules/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'foo';

});

require.define('/modules/index', '/modules/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('/others/same_name', '/others/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'bar';

});

require.define('/others/index', '/others/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('/same_path', '/', function(global, module, exports, require, process, __filename, __dirname) {
require('./modules');
require('./others');

});

})(require);
