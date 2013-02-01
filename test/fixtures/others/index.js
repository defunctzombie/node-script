var mod = require('./same_name');
assert.equal(mod, 'bar');
module.exports = 'others';
done();
