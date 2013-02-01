// global.js requires something from the global path
var glob = require('./modules/global');

assert.equal(glob, 'foobar');
done();
