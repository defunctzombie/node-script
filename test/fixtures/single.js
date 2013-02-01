/// single require
assert.equal(require('./noop'), 'noop');
module.exports = 'single';
assert.equal(__filename, 'single.js');

if (require.main === module) {
    assert.equal(__dirname, '/');
}
done();
