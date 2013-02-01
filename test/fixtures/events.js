// check that events is properly shimmed
var EventEmitter = require('events').EventEmitter;

var ev = new EventEmitter();

ev.on('done', done);
ev.emit('done');
