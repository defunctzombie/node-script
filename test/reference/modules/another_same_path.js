(function(require) {
require.define('./', '', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('./same_name', '', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'foo';

});

require.define('../others', '../others/', function(global, module, exports, require, process, __filename, __dirname) {
require('./same_name');

});

require.define('../others/./same_name', '../others/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = 'bar';

});

require.define('script/main.another_same_path.js', '', function(global, module, exports, require, process, __filename, __dirname) {
require('./');
require('../others');

});

})(require);
