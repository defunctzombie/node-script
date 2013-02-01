
// builtin
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');

// local
var script = require('../');

function add_test(filename) {
    test(filename, function(done) {
        var full_path = __dirname + '/fixtures/' + filename;
        var expect_path = __dirname + '/reference/' + filename;

        script.file(full_path, { client: true, main: true }).generate(function(err, src) {
            assert.ok(!err, err);

            var count = 0;
            var context = {
                console: console,
                window: {},
                assert: assert,
                done : function () {
                    count++;
                }
            };

            vm.runInNewContext(src, context);
            assert(count > 0);
            done();
        });
    });
}

fs.readdirSync(__dirname + '/fixtures').forEach(function(fixture) {
    // skip directories and vim swap files
    if (!/.js$/.test(fixture) || fixture.indexOf('.swp') >= 0) {
        return;
    }

    add_test(fixture);
});

// checks for loading one level up
add_test('modules/up.js');
add_test('modules/another_same_path.js');
