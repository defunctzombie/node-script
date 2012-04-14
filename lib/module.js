
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

var _deps = [];
var _aliases = [];
var _wait = [];
var _entry;

var orig_compile = module.Module.prototype._compile
module.Module.prototype._compile = function(content, filename) {
    var self = this;

    // track loaded files to uncache them
    required.push(filename);

    // entry point
    if (!req_name) {
        req_name = __jsbundler.module_name || '__entry__';

        // set the entry content
        _entry = {
            name: req_name,
            content: content,
        }
    } else {
        _deps.push({
            name: req_name,
            content: content,
        });
    }

    // get the requires from the source
    var requires = detective(content);

    // phony source file with just a list of requires
    // this is what will be passed on down the module loading system
    var phony_src = '';

    requires.forEach(function(req) {
        // externally loaded needs to wrap the current content
        if (external.indexOf(req) >= 0) {
            var url = __jsbundler.options.external[req];

            _wait.push({
                name: req,
                url: url,
            });

            // skip adding to phony source
            return;
        }

        phony_src += 'require(\'' + req + '\');'
    });

    return orig_compile.call(self, phony_src, filename);
}

var orig_require = module.Module.prototype.require;
module.Module.prototype.require = function(path) {
    var self = this;

    // special handling for natives
    var native = natives[path];
    if (native) {
        _deps.push({
            name: path,
            content: native,
        });
        return orig_require.call(self, path);
    }

    // get the real full path of the file
    var full_path = module._resolveFilename(path, self);

    // the first alias for a path is the canonical alias
    var alias = aliases[full_path];
    // register alias
    if (!alias) {
        aliases[full_path] = path;
    }
    // do we need to use the alias?
    else if (path !== alias) {
        _aliases.push({
            name: path,
            alias: alias,
        });
    }

    // capture the short require name
    // this is used in the _compile method above to register the module
    req_name = path;
    return orig_require.call(self, path);
}

new module.Module(__jsbundler.filename, null).load(__jsbundler.filename);

// output location
var out = __jsbundler.out;

// assemble final output
// aliases
// any dependencies
// wait on external
// -entry module
// -require entry
// load externals

_aliases.forEach(function(alias) {
    // map the new short name to an already loaded name
    out += 'require.alias(\'' + alias.name + '\', \'' + alias.alias + '\');\n';
});

_deps.forEach(function(dep) {
    out += 'require.register(\'' + dep.name + '\', ';
    out += 'function(module, exports, require, __filename, __dirname) {\n';
    out += dep.content;
    out += '});\n\n';
});

var wait_post = '';
_wait.forEach(function(wait) {
    out += 'require.wait(\'' + wait.name + '\', function() {\n';
    wait_post += '});\n';
});

// main module code
out += 'require.register(\'' + _entry.name + '\', ';
out += 'function(module, exports, require, __filename, __dirname) {\n';
out += _entry.content;
out += '});\n';
out += 'require(\'' + _entry.name + '\');\n';

out += wait_post;

// load all external dependencies
_wait.forEach(function(wait) {
    out += 'require.script(\'' + wait.url + '\');\n';
});

// put back the prototypes
module.Module.prototype.require = orig_require;
module.Module.prototype._compile = orig_compile;

// uncache anything we loaded otherwise this seems to persist
required.forEach(function(name) {
    delete require.cache[name];
});

