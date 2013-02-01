/// single require
assert.equal(require('./noop'), 'noop');
module.exports = 'single';
done();
