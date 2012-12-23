(function(require) {
require.define('/foo.json', '/', function(global, module, exports, require, process, __filename, __dirname) {
module.exports = {
    "foo": "bar"
}

});

require.define('/json', '/', function(global, module, exports, require, process, __filename, __dirname) {
require('./foo.json');

});

})(require);
