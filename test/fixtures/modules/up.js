/// check loading one level up

/// noop is loaded by single and should appear only once in output
assert.equal(require('../noop'), 'noop');
assert.equal(require('../single'), 'single');

done();
