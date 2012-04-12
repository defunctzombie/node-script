
/// INPUTS
/// filename: the fully qualified filename of the entry point
/// out: the output stream where to write the result js
/// module_name: the name of the root module

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

function write_content(name, content) {
    out += 'require.register(\'' + name + '\', ';
    out += 'function(module, exports, require, __filename, __dirname) {\n';
    out += content;
    out += '});\n\n';
}

var orig_compile = module.Module.prototype._compile
module.Module.prototype._compile = function(content, filename) {
    var self = this;

    // track loaded files to uncache them
    required.push(filename);

    // entry point
    if (!req_name) {
        req_name = module_name;
    }

    // get the requires from the source
    var requires = detective(content);

    write_content(req_name, content);

    // create a new source file with just the list of requires
    var new_content = '';
    requires.forEach(function(req) {
        new_content += 'require(\'' + req + '\');'
    });

    return orig_compile.call(self, new_content, filename);
}

var orig_require = module.Module.prototype.require;
module.Module.prototype.require = function(path) {
    var self = this;

    // special handling for natives
    var native = natives[path];
    if (native) {
        write_content(path, native);
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

new module.Module(filename, null).load(filename);

// put back the prototypes
module.Module.prototype.require = orig_require;
module.Module.prototype._compile = orig_compile;

// uncache anything we loaded otherwise this seems to persist
required.forEach(function(name) {
    delete require.cache[name];
});

