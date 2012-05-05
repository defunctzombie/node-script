
function require(name) {

    // use the offset for relative paths only
    if (require.offset && name[0] === '.') {
        name = require.offset + name;
    }

    // is the name aliased?
    name = require._aliases[name] || name;

    var details = require._modules[name];

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

    details.fn.call(window, window, module, module.exports, require);
    require.offset = previous;
    return module.exports;
}

require.register = function(name, offset, fn) {
    require._modules[name] = {
        offset: offset,
        fn: fn
    };
};

require.alias = function(name, alias) {
    require._aliases[name] = alias;
}

require._aliases = {};
require._modules = {};


