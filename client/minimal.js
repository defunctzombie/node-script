
var require = (function () {

var aliases = {};
var modules = {};

function require(name) {

    // use the offset for relative paths only
    if (require.offset && name[0] === '.') {
        name = require.offset + name;
    }

    // is the name aliased?
    name = aliases[name] || name;

    var details = modules[name];

    // uh oh
    if (!details || !details.fn) {
        throw new Error('no such module: ' + name);
    }

    // already loaded
    if (details.module) {
        return details.module.exports;
    }

    var previous = require.offset;
    require.offset = details.offset;

    // provide empty stub for exports
    var module = details.module = {
        exports: {}
    };

    if (!require.main) {
        require.main = module;
    }

    var process = {};

    details.fn.call(window, window, module, module.exports, require, process);
    require.offset = previous;
    return module.exports;
}

require.define = function(name, offset, fn) {
    modules[name] = {
        offset: offset,
        fn: fn
    };
};

require.alias = function(name, alias) {
    aliases[name] = alias;
}

return require;

})();

