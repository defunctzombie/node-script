
// closure so the 'require' variable can be minified
var require = (function() {

var wrappers = {};
var aliases = {};
var cached = {};

function require(name) {
    // is the name aliased?
    name = aliases[name] || name;

    var cache = cached[name];
    if (cache) {
        return cache;
    }

    var func = wrappers[name];
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
    return cached[name] = module.exports;
}

require.register = function(path, fn) {
    wrappers[path] = fn;
};

require.alias = function(path, alias) {
    aliases[path] = alias;
}

return require;

})();

