
// builtin
var vm = require('vm');
var fs = require('fs');
var path = require('path');

// local
var client = require('../client');

var loader = fs.readFileSync(__dirname + '/module.js');
var script = vm.createScript(loader);

var Bundle = function() {
    var self = this;

    // content to prepend
    self._prepend = [];

    // content to append
    self._append = [];

    // list of modules and names to load
    self._files = [];
}

Bundle.prototype.prepend = function(content) {
    var self = this;
    self._prepend.push(content);
}

Bundle.prototype.append = function(content) {
    var self = this;
    self._append.push(content);
}

Bundle.prototype.require = function(name, filename, opt) {
    var self = this;
    opt = opt || {};

    self._files.push({
        name: name,
        filename: filename,
        options: opt,
    });
}

Bundle.prototype.toString = function() {
    var self = this;
    var result = '';

    // do the magic
    self._files.forEach(function(file) {
        var exports = {};

        var sandbox = {
            __jsbundler: {
                out: '',
                module_name: file.name,
                filename: file.filename,
                options: file.options,
            },
            require: require,
            console: console,
            process: process,
            exports: exports,
            module: {
                exports: exports,
            }
        };

        // very meta :)
        sandbox.global = sandbox;

        script.runInNewContext(sandbox);

        result += '(function(require) {\n';
        result += sandbox.out;
        result += '\n})(require);';
    });

    return self._prepend.join() + result + self._append.join();
};

Bundle.prototype.middleware = function(opt) {
    var self = this;

    opt = opt || {
        max_age: 0,
        cache: false,
        compress: false,
    };

    var max_age = opt.max_age;
    var cache = opt.cache;
    var compress = opt.compress;

    var cached;
    function gen_source() {
        if (cached) {
            return cached;
        }
        var source = self.toString();

        if (compress) {
            var uglifyjs = require('uglify-js');
            var uglify = uglifyjs.uglify;
            var ast = uglifyjs.parser.parse(source);
            ast = uglify.ast_mangle(ast);
            ast = uglify.ast_squeeze(ast);
            source = uglify.gen_code(ast);
        }

        // to cache or not to cache, that is the question
        if (cache) {
            cached = source;
        }

        return source;
    }

    return function(req, res, next) {
        var source = gen_source();

        res.setHeader('Date', new Date().toUTCString());
        res.setHeader('Cache-Control', 'public, max-age=' + (max_age / 1000));
        res.setHeader('Content-Type', 'text/javascript; charset=utf8');
        res.setHeader('Vary', 'Accept-Encoding');

        res.end(source);
    };
};

module.exports.Bundle = Bundle;

module.exports = function(arg) {

    var bundle = new Bundle();

    var name = arg.name;
    var use_client = arg.use_client;

    // single file mode
    if (typeof arg === 'string') {
        use_client = true;
        name = '__entry__';
        bundle.require(name, arg);
    }
    // multi source stuff
    else {
        if (!name) {
            name = path.basename(arg.src, '.js');
        }

        bundle.require(name, arg.src, arg);
    }

    // include require function emulation code
    if (use_client) {
        bundle.prepend(client.toString());
    }

    return bundle;
}

