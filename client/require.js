
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

    // mod A sets the export object to a function, then requires mod B
    // mod B requires mod A. Because mod A was able to set the exports
    // the require in mod B should return the function and not the stub
    // object that exports starts out as

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

require.script = function(url) {
    (function() {
        var script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(script, s);
    })();
}

require.register = function(name, offset, fn) {
    var module = get(name);

    // register module function
    module.offset = offset;
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

