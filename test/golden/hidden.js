require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// even requires in if statements and functions should be found

function func() {
    require('./single');
}

if (hi) {
    require('./noop');
}

});

require.register('./single', function(module, exports, require, __filename, __dirname) {
/// single require

var noop = require('./noop');
});

require.register('./noop', function(module, exports, require, __filename, __dirname) {
/// no content
});

require('__entry__');