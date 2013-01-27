(function(require) {
require.define('/noop.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// no content

});

require.define('/hidden.js', '/', function(global, module, exports, require, __filename, __dirname) {
/// even requires in if statements and functions should be found

// TODO add an 'expects' method to assert

function func() {
    require('./noop');
}

if (true) {
    func();
}

assert.equal(noop_load_count, 1);


});

})(require);
