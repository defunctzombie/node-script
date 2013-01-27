(function(require) {
require.alias('/modules', '/modules/index.js');
require.alias('/others', '/others/index.js');
require.define('/modules/index.js', '/modules/', function(global, module, exports, require, __filename, __dirname) {
require('./same_name');

});

require.define('/others/index.js', '/others/', function(global, module, exports, require, __filename, __dirname) {
require('./same_name');

});

require.define('/modules/same_name.js', '/modules/', function(global, module, exports, require, __filename, __dirname) {
module.exports = 'foo';

});

require.define('/same_path.js', '/', function(global, module, exports, require, __filename, __dirname) {
require('./modules');
require('./others');

});

require.define('/others/same_name.js', '/others/', function(global, module, exports, require, __filename, __dirname) {
module.exports = 'bar';

});

})(require);
