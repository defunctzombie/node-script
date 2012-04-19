var EventEmitter = require('events').EventEmitter;

var ev = new EventEmitter();

var count = 0;
ev.on('good', function() {
    ++count;
});

ev.emit('good');

assert.equal(count, 1);

