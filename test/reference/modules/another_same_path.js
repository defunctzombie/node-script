(function(require) {
require.alias('/', '/index');
require.alias('/../others', '/../others/index');
require.define('/same_name', '/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'foo';

});

require.define('/index', '/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('/../others/same_name', '/../others/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'bar';

});

require.define('/../others/index', '/../others/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('/another_same_path', '/', function(global, module, exports, require, process, __filename, __dirname) {
require('./');
require('../others');

});

})(require);
