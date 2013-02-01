/// even requires in if statements and functions should be found

// TODO add an 'expects' method to assert

var foo;
function func() {
    foo = require('./noop');
}

if (true) {
    func();
}

assert.equal(foo, 'noop');
done();
