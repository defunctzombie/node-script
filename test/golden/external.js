require.wait('core', function() {
require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// test that the core library is not included inline

var core = require('core');
});
require('__entry__');
});
require.script('/some/url/to/core.js');
