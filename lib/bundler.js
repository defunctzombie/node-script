
var vm = require('vm');
var fs = require('fs');

var loader = fs.readFileSync(__dirname + '/module.js');
var script = vm.createScript(loader)

module.exports = function(filename) {

    var sandbox = {
        out: '',
        filename: filename,
        require: require,
        console: console,
        module: {
            exports: {}
        }
    };
    script.runInNewContext(sandbox);

    return sandbox.out;
}

