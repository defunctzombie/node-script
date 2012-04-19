/// check that noop only gets loaded once
/// single will require noop again

var noop = require('./noop');
assert.equal(noop_load_count, 1);

var noop = require('./noop');
assert.equal(noop_load_count, 1);

