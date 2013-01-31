
var require = (function (window) {

var aliases = {};
var modules = {};

function require(name) {

    if (name[0] === '.' && name[1] === '/') {
        name = name.slice(2);
    }

    var self = this;
    if (self._parent) {
        name = self._parent.path + name;
    }

    // is the name aliased?
    name = aliases[name] || name;

    var details = modules[name];

    // try to lookup by .js name
    // we don't alias .js extensions
    if (!details) {
        details = modules[name + '.js'];
    }

    // uh oh
    if (!details || !details.fn) {
        throw new Error('no such module: ' + name);
    }

    // already loaded
    if (details.module) {
        return details.module.exports;
    }

    // the require should be isolated
    var req = function(name) {
        return require.call(req, name);
    };

    req._parent = {
        path: details.offset
    };

    // provide empty stub for exports
    var module = details.module = {
        exports: {}
    };

    if (!require.main) {
        req.main = module;
    }

    details.fn.call(window, window, module, module.exports, req, name, details.offset);
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

})(window);

