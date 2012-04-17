
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

    var module = {
        exports: {}
    };

    if (!require.main) {
        require.main = module;
    }

    details.fn(module, module.exports, require);
    return details.exports = module.exports;
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

