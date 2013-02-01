var mod = require('./same_name');
assert.equal(mod, 'foo');
module.exports = 'brains';
done();
