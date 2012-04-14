
/// INPUTS in the __jsbundler global

// builtin
var module = require('module');
var natives = process.binding('natives');

// 3rd party
var detective = require('detective');

// map of short request name to full filename
var req_name;

// list of all the filenames that we loaded
// we need to uncache them after loading
var required = [];

// the first short name for a module is the canonical name
var aliases = {};

// modules we will externally load
var external = Object.keys(__jsbundler.options.external || {});

// output bundle
var out = __jsbundler.out;

var orig_compile = module.Module.prototype._compile
module.Module.prototype._compile = function(content, filename) {
    var self = this;

    // track loaded files to uncache them
    required.push(filename);

    var is_main = false;

    // entry point
    if (!req_name) {
        req_name = __jsbundler.module_name || '__entry__';
        is_main = true;
    }

    // get the requires from the source
    var requires = detective(content);

    // phony source file with just a list of requires
    var phony_src = '';

    var src = 'require.register(\'' + req_name + '\', ' +
        'function(module, exports, require, __filename, __dirname) {\n' +
        content +
        '});\n';

    if (is_main) {
        src += 'require(\'' + req_name + '\');\n';
    }

    var res = '';

    requires.forEach(function(req) {
        // externally loaded needs to wrap the current content
        if (external.indexOf(req) >= 0) {
            var url = __jsbundler.options.external[req];

            src = 'require.wait(\'' + req + '\', function() {\n' + src + '});\n';
            src += '//cause script to be loaded\n';
            src += 'require.script(\'' + url + '\');\n';

            // skip loading locally
            return;
        }

        phony_src += 'require(\'' + req + '\');'
    });

    // the main module should be at the end of the file
    if (is_main) {
        out += src;
    }
    else {
        out = src + out;
    }

    return orig_compile.call(self, phony_src, filename);
}

var orig_require = module.Module.prototype.require;
module.Module.prototype.require = function(path) {
    var self = this;

    // special handling for natives
    var native = natives[path];
    if (native) {
        out += 'require.register(\'' + path + '\', ';
        out += 'function(module, exports, require, __filename, __dirname) {\n';
        out += native;
        out += '});\n\n';
        return orig_require.call(self, path);
    }

    // get the real full path of the file
    var full_path = module._resolveFilename(path, self);

    // the first alias for a path is the canonical alias
    var alias = aliases[full_path];
    if (!alias) {
        aliases[full_path] = path;
    }
    else if (path !== alias) {
        // map the new short name to an already loaded name
        out += 'require.alias(\'' + path + '\', \'' + alias + '\');\n';
    }

    // capture the short require name
    // this is used in the _compile method above to register the module
    req_name = path;
    return orig_require.call(self, path);
}

new module.Module(__jsbundler.filename, null).load(__jsbundler.filename);

// put back the prototypes
module.Module.prototype.require = orig_require;
module.Module.prototype._compile = orig_compile;

// uncache anything we loaded otherwise this seems to persist
required.forEach(function(name) {
    delete require.cache[name];
});

