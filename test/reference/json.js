(function(require) {
require.define('/json.js', '/', function(global, module, exports, require, __filename, __dirname) {
require('./foo.json');

});

require.define('/foo.json', '/', function(global, module, exports, require, __filename, __dirname) {
module.exports = {
    "foo": "bar"
}

});

})(require);
