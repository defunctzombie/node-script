
// builtin
var fs = require('fs');

/// expose the filename of the require.js client bound file
Object.defineProperty(module.exports, 'filename', {
    value: __dirname + '/require.js'
});

/// return the source of the require.js client side code
module.exports.toString = function() {
    return fs.readFileSync(__dirname + '/require.js', 'utf8');
}

