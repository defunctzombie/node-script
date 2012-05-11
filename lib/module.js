
/// INPUTS in the __jsbundler global

// builtin
var module = require('module');
var natives = process.binding('natives');
var path = require('path');
var fs = require('fs');

// 3rd party
var detective = require('detective');

// map of short request name to full filename
var req_name;

// the first short name for a module is the canonical name
var aliases = {};

// modules we will externally load
var external = __jsbundler.options.external || {};

// shim modules
var shims = __jsbundler.options.shims || {};

var _deps = [];
var _aliases = [];
var _wait = [];
var _entry;

var basepath;

var orig_compile = module.Module.prototype._compile
module.Module.prototype._compile = function(content, filename) {
    var self = this;

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
            offset: self.parent.offset || '',
            content: content,
        });
    }

    var alias = aliases[filename];
    if (!alias) {
        aliases[filename] = req_name;
    }


    // get the requires from the source
    var requires = detective(content);

    // phony source file with just a list of requires
    // this is what will be passed on down the module loading system
    var phony_src = '';

    requires.forEach(function(req) {
        var url = external[req];
        if (url) {
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
module.Module.prototype.require = function(name) {
    var self = this;

    // special handling for natives
    var native = natives[name];
    if (native) {
        _deps.push({
            name: name,
            offset: '',
            content: native,
        });
        return orig_require.call(self, name);
    }

    // capture the short require name
    // this is used in the _compile method above to register the module
    req_name = name;

    if (self.parent && self.parent.offset && req_name[0] === '.') {
        req_name = self.parent.offset + name;
    }

    // detect if require has a package.json which specifies shims
    var resolved_module = module.Module._resolveLookupPaths(name, self);
    var paths = resolved_module[1];

    var filename = module.Module._findPath(name, paths);
    for (var i=0 ; i<paths.length ; ++i) {
        var base = path.resolve(paths[i], name);
        //var package = read_package(base);
        var json_path = path.resolve(base, 'package.json');
        try {
            var json = JSON.parse(fs.readFileSync(json_path, 'utf8'));

            // did the module specify shims? if so add them to known shims
            if (json.shims) {
                Object.keys(json.shims).forEach(function(shim_name) {
                    shims[shim_name] = path.resolve(base, json.shims[shim_name]);
                });
            }

            break;
        }
        catch (e) {
            // no-op
        }
    }

    // get the real full path of the file
    var full_path = module._resolveFilename(name, self);

    var dirname = path.dirname(full_path);
    var relative = path.relative(basepath, dirname);

    if (relative.length > 0) {
        self.offset = relative + '/';
    }

    var alias = aliases[full_path];
    if (alias && alias !== req_name) {
        _aliases.push({
            name: req_name,
            alias: alias,
        });
    }

    // if module has a shim, change require path to shim location
    var shim = shims[name];
    if (shim) {
        name = shim;
    }

    return orig_require.call(self, name);
}

// save current state of module cache
// we cannot have any cached modules because we need them to be loaded
// otherwise we will never capture their content
var save_cache = module.Module._cache;
module.Module._cache = [];

// set the basepath
basepath = path.dirname(__jsbundler.filename);

new module.Module(__jsbundler.filename, null).load(__jsbundler.filename);

module.Module._cache = save_cache;

// output location
var out = __jsbundler.out;

// assemble final output
// aliases
// any dependencies
// wait on external
// -register entry
// -require entry
// load externals

_aliases.forEach(function(alias) {
    // map the new short name to an already loaded name
    out += 'require.alias(\'' + alias.name + '\', \'' + alias.alias + '\');\n';
});

_deps.forEach(function(dep) {
    out += 'require.register(\'' + dep.name + '\', \'' + dep.offset + '\', ';
    out += 'function(global, module, exports, require, __filename, __dirname) {\n';
    out += dep.content;
    out += '});\n\n';
});

var wait_post = '';
_wait.forEach(function(wait) {
    out += 'require.wait(\'' + wait.name + '\', function() {\n';
    wait_post += '});\n';
});

// main module code
out += 'require.register(\'' + _entry.name + '\', \'\', ';
out += 'function(global, module, exports, require, __filename, __dirname) {\n';
out += _entry.content;
out += '});\n';
out += 'return require(\'' + _entry.name + '\');\n';

out += wait_post;

// load all external dependencies
_wait.forEach(function(wait) {
    out += 'require.script(\'' + wait.url + '\');\n';
});

// put back the prototypes
module.Module.prototype.require = orig_require;
module.Module.prototype._compile = orig_compile;

