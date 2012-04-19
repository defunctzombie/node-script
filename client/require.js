
// closure so the 'require' variable can be minified
var require = (function () {

var aliases = {};
var modules = {};

function get(name) {
    var module = modules[name];
    if (module) {
        return module;
    }

    return modules[name] = {
        waiting: []
    };
}

function require(name) {
    // is the name aliased?
    name = aliases[name] || name;

    var details = modules[name];

    if (!details || !details.fn) {
        throw new Error('no such module: ' + name);
    }

    if (details.exports) {
        return details.exports;
    }

    // provide empty stub for exports
    details.exports = {};
    var module = {};

    // the following code exists to support the use case described below
    // mod A sets the export object to a function, then requires mod B
    // mod B requires mod A. Because mod A was able to set the exports
    // the require in mod B should return the function and not the stub
    // object that exports starts out as
    Object.defineProperty(module, 'exports', {
        get: function() {
            return details.exports;
        },
        set: function(val) {
            details.exports = val;
        }
    });

    if (!require.main) {
        require.main = module;
    }

    details.fn(window, module, module.exports, require);
    return details.exports;
}

require.script = function(url) {
    $.ajax({
        url: url,
        cache: true,
        dataType: 'script'
    });
}

require.register = function(name, fn) {
    var module = get(name);

    // register module function
    module.fn = fn;

    // don't use forEach to be IE compatible
    for (var i=0 ; i<module.waiting.length ; ++i) {
        module.waiting[i]();
    }
};

require.alias = function(name, alias) {
    aliases[name] = alias;
}

require.wait = function(name, cb) {
    var module = get(name);

    // already loaded
    if (module.exports) {
        return cb();
    }

    module.waiting.push(cb);
}

return require;

})();

