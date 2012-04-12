
// closure so the 'require' variable can be minified
var require = (function() {

function require(name) {
    // is the name aliased?
    name = require.aliases[name] || name;

    var cached = require.cached[name];
    if (cached) {
        return cached;
    }

    var func = require.wrappers[name];
    if (!func) {
        throw new Error('no such module: ' + name);
    }

    var module = {
        exports: {}
    };

    if (!require.main) {
        require.main = module;
    }

    func(module, module.exports, require);
    return require.cached[name] = module.exports;
}

require.register = function(path, fn) {
    require.wrappers[path] = fn;
};

require.alias = function(path, alias) {
    require.aliases[path] = alias;
}

require.aliases = {};
require.wrappers = {};
require.cached = {};

return require;

})();

