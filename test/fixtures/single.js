/// single require

var noop = require('./noop');

assert.equal(noop_load_count, 1);
