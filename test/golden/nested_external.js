require.register('./external', function(module, exports, require, __filename, __dirname) {
/// test that the core library is not included inline

var core = require('core');
});

require.wait('core', function() {
require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// external will be required inline but it contains an external dep
/// this should cause the main module to be wrapped with the proper loader
/// and wait

var ext = require('./external');
});
require('__entry__');
});
require.script('/some/url/to/core.js');
