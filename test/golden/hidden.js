require.register('__entry__', function(module, exports, require, __filename, __dirname) {
/// even requires in if statements should be found

if (hi) {
    require('./noop');
}

});

require.register('./noop', function(module, exports, require, __filename, __dirname) {
/// no content
});

require('__entry__');