
// builtin
var assert = require('assert');
var fs = require('fs');

// local
var bundler = require('../');

var gen_gold = process.env.BUNDLER_GEN_GOLD;

function add_test(filename) {
    test(filename, function() {
        var actual = bundler.bundle(__dirname + '/fixtures/' + filename);

        var gold_filename = __dirname + '/golden/' + filename;
        if (gen_gold) {
            fs.writeFileSync(gold_filename, actual);
        }

        var expected = fs.readFileSync(gold_filename, 'utf8');
        assert.equal(actual, expected);
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

