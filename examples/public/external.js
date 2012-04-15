
// core is loaded async but its code is not run yet
// it is evaluated when the first file requires it

var core = require('core');

core.write('2) external.js module code loaded');


