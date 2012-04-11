require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// make sure loading from inside a directory works

var sample = require('./modules/sample');
});

require.register('./modules/sample', function(module, exports, require, __filename, __dirname) {

module.exports = function() {
}

});

require('__entry__');