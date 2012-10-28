
// builtin
var assert = require('assert');
var fs = require('fs');

// local
var script = require('../');

test('noop as external', function(done) {
    // noop is an external and should not appear in output
    var noop = script.file(__dirname + '/fixtures/noop.js');

    // this should only contain the double as noop is found in the single
    script.file(__dirname + '/fixtures/single.js', {
        main: true,
        externals: [
            noop
        ],
        externals_url: function(cb) {
            return cb(null, '/dummy/url/' + this.name);
        }
    }).generate(function(err, source) {
        assert.ok(!err, err);

        // TODO
        //console.log(source);
        done();
    });
});

// single contains noop, but since we don't use single directly
// our bundle should also contain noop
// this will prevent pulling in single and its dependencies
test('ignore passthrough', function(done) {
    var single = script.file(__dirname + '/fixtures/single.js');

    // this should only contain the double as noop is found in the single
    script.file(__dirname + '/fixtures/double.js', {
        externals: [
            single
        ],
        externals_url: function(cb) {
            return cb(null, '/dummy/url/' + this.name);
        }
    }).generate(function(err, source) {
        assert.ok(!err, err);

        // TODO
        //console.log(source);
        done();
    });
});

// our file uses single and noop, and since noop is found in single, we can just load single as an external

