
// builtin
var assert = require('assert');
var fs = require('fs');

// local
var script = require('../');

function add_test(filename) {
    test(filename, function(done) {
        var full_path = __dirname + '/fixtures/' + filename;
        var expect_path = __dirname + '/reference/' + filename;

        script.file(full_path).generate(function(err, source) {
            assert.ok(!err, err);

            if (process.env.GENERATE) {
                fs.writeFileSync(expect_path, source, 'utf8');
                return done();
            }

            var expected = fs.readFileSync(expect_path, 'utf8');
            assert.equal(source, expected);
            done();
        });
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
