
// builtin
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');

// local
var script = require('../');

function add_test(filename) {
    test(filename, function() {
        var full_path = __dirname + '/fixtures/' + filename;

        var src = script.bundle({
            src: full_path,
            use_client: true,
            name: '__entry__',
        }).toString();

        var sandbox = {
            window: {},
            assert: assert,
            console: console,
            Array: Array,
            Date: Date,
            String: String,
        };

        sandbox.global = sandbox;
        vm.runInNewContext(src, sandbox, full_path);
    });
}

fs.readdirSync(__dirname + '/fixtures').forEach(function(fixture) {
    // skip directories and vim swap files
    if (fixture.indexOf('.js') < 0 || fixture.indexOf('.swp') >= 0) {
        return;
    }

    add_test(fixture);
});

// checks for loading one level up
add_test('modules/up.js');
add_test('modules/another_same_path.js');
