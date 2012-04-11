/// check that noop only gets loaded once
/// single will require noop again

var noop = require('./noop');
var single = require('./single');

module.exports = function() { };
