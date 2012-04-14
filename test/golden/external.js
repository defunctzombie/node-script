require.wait('core', function() {
require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// test that the external library is not included

var core = require('core');
});
require('__entry__');
});
//cause script to be loaded
require.script('/some/external/url.js');
