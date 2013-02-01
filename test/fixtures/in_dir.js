/// make sure loading from inside a directory works
var sample = require('./modules/sample');

assert.equal(sample, 22);
done();
