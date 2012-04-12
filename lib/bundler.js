
// builtin
var vm = require('vm');
var fs = require('fs');

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

Bundle.prototype.require = function(name, filename) {
    var self = this;
    self._files.push({
        name: name,
        filename: filename
    });
}

Bundle.prototype.toString = function() {
    var self = this;
    var result = '';

    // do the magic
    self._files.forEach(function(file) {
        var sandbox = {
            out: '',
            module_name: file.name,
            filename: file.filename,
            require: require,
            console: console,
            process: process,
            module: {
                exports: {}
            }
        };
        script.runInNewContext(sandbox);

        result += sandbox.out;
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

        res.send(source);
    };
};

module.exports.Bundle = Bundle;

module.exports = function(arg) {

    var bundle = new Bundle();

    // single file mode
    if (typeof arg === 'string') {
        bundle.require('__entry__', arg);
        bundle.prepend(client.toString());
        bundle.append('require(\'__entry__\');');
        return bundle;
    }

    // multi source stuff
    bundle.require(arg.name, arg.src);

    if (arg.use_client) {
        bundle.prepend(client.source());
    }

    return bundle;
}

