
// builtin
var fs = require('fs');
var path = require('path');
var natives = process.binding('natives');

// 3rd party
var required = require('required');
var merge = require('merge');

// local
var client = require('../client');

// shims we provide by default for core modules
// any user specified shims will add to this (or override it)
var k_default_shims = {
    'events': require.resolve('../shims/events'),
    'http': require.resolve('http-browserify'),
    'child_process': require.resolve('../shims/child_process'),
    'stream': require.resolve('../shims/stream'),
    'process': require.resolve('process/browser'),
    'util': require.resolve('../shims/util'),
};

/// @return {Boolean} true if [id] is a native module
var is_native = function(id) {
    return !!natives[id];
};

var Bundle = function(filename, opt) {
    var self = this;

    opt = opt || {};

    self._files = [];

    self._files.push(filename);
    self._entry = filename;

    // safe to prefix using 'script/entry.base_filename.js'
    // this will prevent conflict as it is namespaced under script
    self.name = opt.name || ('script/main.' + path.basename(filename));

    self._debug = opt.debug || false;

    self._main = opt.main || false;
    self._client = opt.client || false;
    self._name = opt.name;

    self._externals = opt.external || [];

    // a shim is 'name' -> '/path/to/file.js'
    // merge user shims over default shims
    self._shims = merge(k_default_shims, opt.shims || {});
}

Bundle.prototype.require = function(filename, entry) {
    var self = this;

    self._files.push(filename);

    if (entry) {
        self._entry = filename;
    }
}

// generate the bundled string
Bundle.prototype.generate = function(cb) {
    var self = this;

    var out = '(function(require) {\n';

    self.normalize(function(err, result) {
        if (err) {
            return cb(err);
        }

        var deps = result.deps;
        var aliases = result.aliases;

        Object.keys(aliases).forEach(function(from) {
            var to = aliases[from];

            // ignore aliases from /module to /module.js
            // the client script handles this
            if (from + '.js' === to) {
                return;
            }

            // map the new short name to an already loaded name
            out += 'require.alias(\'' + from + '\', \'' + to + '\');\n';
        });

        // fullpath -> source
        var sources = {};

        // load sources
        function load_sources(cb) {
            var paths = Object.keys(deps);
            (function next(err) {
                var path = paths.shift();
                if (!path) {
                    return cb();
                }

                fs.readFile(path, 'utf8', function(err, src) {
                    if (err) {
                        return cb(err);
                    }

                    sources[path] = src;
                    next();
                });
            })();
        }

        load_sources(function(err) {
            if (err) {
                return cb(err);
            }

            var paths = Object.keys(deps);

            paths.forEach(function(path) {
                var info = deps[path];

                var name = info.name;
                var offset = info.offset;
                var src = sources[path];

                // support require('foo.json')
                if (/[.]json$/.test(name)) {
                    src = 'module.exports = ' + src;
                }

                out += 'require.define(\'' + name + '\', \'' + offset + '\', ';

                if (self._debug) {
                    out += 'Function([\'global\', \'module\', \'exports\', \'require\', \'__filename\', \'__dirname\'], ' + JSON.stringify(src + '\n//@ sourceURL=' + name) + '));\n\n';
                }
                else {
                    out += 'function(global, module, exports, require, __filename, __dirname) {\n';
                    out += src;
                    out += '\n});\n\n';
                }

            });

            if (self._main && self._entry) {
                var entry = deps[self._entry];
                out += 'return require(\'' + entry.name + '\');\n';
            }

            // close the whole closure
            out += '})(require);\n';

            if (self._client) {
                out = '(function(window) {\n' + client.toString() + '\n' + out + '})(window);';
            }

            cb(null, out);
        })
    });
};

/// TODO should be recursive since having our externals contain a file
/// is the same to us as having their externals contain the file
/// need to make sure external is resolved
Bundle.prototype.external = function(filename) {
    var self = this;

    // if our externals are our filename directly, then use the external
    // TODO any externals in the chain should be allowed to stand in for an external

    var externals = self._externals;
    for (var i=0 ; i<externals.length ; ++i) {
        var external = externals[i];
        if (external._entry === filename) {
            return external;
        }
    }

    return null;
};

// flatten deps
// deps is a tree
// flatten into an object of
// {
//  filename: {
//      requires: {
//          'a': '/full/path/to/a',
//          'b': '/full/path/to/b'
//      }
// }
Bundle.prototype.flatten = function(deps) {
    var self = this;

    var flat = {};

    deps.forEach(function(dep) {
        var reqs = {};

        if (self.external(dep.filename)) {
            return
        };

        dep.deps.forEach(function(dep) {
            reqs[dep.id] = dep.filename;
        });

        // bring in all the child dependencies
        merge(flat, self.flatten(dep.deps));
        flat[dep.filename] = reqs;
    });

    return flat;
};

Bundle.prototype.resolve = function(cb) {
    var self = this;

    var result = {};

    var count = 0;
    (function next(err) {
        if (err) {
            return cb(err, result);
        }

        if (count >= self._files.length) {
            return cb(null, result);
        }

        var file = self._files[count++];
        self.load_file(file, function(err, res) {
            result = merge(result, res);
            next(err);
        });
    })();
};

Bundle.prototype.load_file = function(filename, cb) {
    var self = this;

    // basepath is used to create the aliases for path lookup
    var basepath = path.dirname(filename);

    var shims = self._shims;

    required(filename, { ignoreMissing: true }, function(err, deps) {
        if (err) {
            return cb(err);
        }

        shim(deps, shims, function(err) {
            if (err) {
                return cb(err);
            }

            // should be done after shim since native modules
            // will have filename populated
            var ids = {};
            deps.reduce(function(prev, curr, idx, arr) {
                prev[curr.id] = curr.filename;
                return prev;
            }, ids);

            var flat = self.flatten(deps);

            // deps for the entry file
            flat[filename] = ids;

            cb(null, flat);
        });
    });
};

Bundle.prototype.normalize = function(cb) {
    var self = this;

    var filename = self._entry;

    // basepath is used to create the aliases for path lookup
    var basepath = path.dirname(filename);

    var shims = self._shims;

    self.resolve(function(err, flat) {
        if (err) {
            return cb(err);
        }

        var paths = Object.keys(flat);

        var registry = {};

        // exported aliases
        var aliases = {};

        // register all of the dependencies
        paths.forEach(function(file) {
            var basename = path.basename(file);
            var dirname = path.dirname(file);
            var relative = path.relative(basepath, dirname);

            var name = '/' + path.join(relative, basename);

            if (relative) {
                relative += '/';
            }

            if (file === filename && self._name) {
                name = '/' + self._name;
            }

            // we will see the full path later
            // for now, we just need to do what?
            // register the entry for this pathname
            registry[file] = {
                name: name,
                offset: '/' + relative
            };
        });

        // setup aliases
        // shortname is what the file is registered as
        // in our file we have require(<id>)
        // we lookup the fullpath for that id from the registry
        // and make an alias from ./relative/id to the registered path
        paths.forEach(function(file) {
            var dirname = path.dirname(file);
            var relative = path.relative(basepath, dirname);

            // we now have a registry of all the full file paths
            // -> the registered name
            // now just make aliases for the reqs -> registered name
            var reqs = flat[file];
            Object.keys(reqs).forEach(function(id) {
                var filename = reqs[id];

                // ./ requires are trimmed aray
                if (id[0] === '.' && id[1] === '/') {
                    id = id.slice(2);
                }

                // rel is the absolute path to the require with offset applied
                var rel = '/' + id;
                if (relative) {
                    rel = '/' + relative + rel;
                }

                // TODO(shtylman) this means it was in an external
                // since we never registered the file
                // should register external files
                if (!registry[filename]) {
                    aliases[rel] = '/' + id;
                    return;
                }

                var reg_name = registry[filename].name;

                // ignore noop aliases
                if (rel === reg_name) {
                    return;
                }

                // paths with .. are always aliased
                // client does not do path operations
                if (id[0] === '.' && id[1] === '.') {
                    aliases[rel] = reg_name;
                    return;
                }

                aliases[rel] = reg_name;
            });
        });

        cb(null, {
            deps: registry,
            aliases: aliases
        });
    });
};

// return a path for package.json from given basepath
function pkg_find(basepath) {
    if (!basepath) {
        return;
    }

    var pkg_path = basepath + '/package.json';
    if (fs.existsSync(pkg_path)) {
        return pkg_path;
    }

    // up up up!
    return pkg_find(path.dirname(basepath));
}

// take a set of deps and replace with any shims
function shim(deps, shims, cb) {
    if (!deps || deps.length === 0) {
        return cb(null);
    }

    var count = 0;

    // filenames which we have already loaded package.json
    var loaded_pkgs = {};

    // loop deps
    // see if we need to keep each one
    (function next() {
        if (count >= deps.length) {
            return cb(null);
        }

        var dep = deps[count++];
        if (dep.seen) {
            return next();
        }

        // find a suitable package.json file
        // this is where we find the shims
        // once we have seen a filename, there is no need to check
        // it again
        if (dep.filename && !loaded_pkgs[dep.filename]) {
            loaded_pkgs[dep.filename] = true;
            var basepath = path.dirname(dep.filename);

            // TODO async
            var pkg_path = pkg_find(basepath);

            if (pkg_path) {
                var pkg_info = JSON.parse(fs.readFileSync(pkg_path, 'utf8'));
                var base = path.dirname(pkg_path);

                // shims field is deprecated
                for (var key in pkg_info.shims) {
                    var shim_path = path.join(base, pkg_info.shims[key]);
                    if (key[0] === '.') {
                        key = path.normalize(path.join(base, key));
                    }
                    shims[key] = shim_path;
                }

                var browser = pkg_info.browser || pkg_info.browserify;
                if (browser) {
                    if (typeof browser === 'string') {
                        // use this in place of main
                        // main is either specified in pkg_info or is index.js
                        var main = path.join(base, pkg_info.main || 'index.js');

                        // some people apparently hate extensions
                        var ext = path.extname(main);
                        if (!ext) {
                            main += '.js';
                        }

                        shims[main] = path.join(base, browser);
                    }
                    else if (typeof browser === 'object') {
                        for (var key in pkg_info.browser) {
                            var shim_path = path.join(base, pkg_info.browser[key]);
                            if (key[0] === '.') {
                                key = path.normalize(path.join(base, key));
                            }
                            shims[key] = shim_path;
                        }
                    }
                }
            }
        }

        dep.seen = true;

        // this will be called at the final dep
        var shim_filename = shims[dep.id];

        // if shim was loaded by id, then don't override
        if (!shim_filename && dep.filename) {
            shim_filename = shims[dep.filename];
        }

        if (shim_filename) {
            required(shim_filename, { ignoreMissing: true }, function(err, shim_deps) {
                if (err) {
                    return cb(err);
                }

                dep.filename = shim_filename;
                dep.native = is_native(dep.id);

                // need to shim any deps in the loaded shim
                // a shim could require modules which need to be shimmed
                shim(shim_deps, shims, function(err) {
                    dep.deps = shim_deps;
                    next();
                });
            });

            return;
        }

        shim(dep.deps, shims, function(err) {
            if (err) {
                return cb(err);
            }

            delete dep.seen;
            next();
        });
    })();
};

module.exports.Bundle = Bundle;

// .file(/path/to/local/file, opt);
module.exports.file = function(filename, opt) {
    return new Bundle(filename, opt);
};

// .module('some-module', opt);
module.exports.module = function(name, opt) {

    var filename = require.resolve(name);
    var base = path.dirname(filename);

    // TODO(shtylman) check up the tree for package.json
    var pkg_path = path.join(base, 'package.json');
    if (fs.existsSync(pkg_path)) {
        var info = JSON.parse(fs.readFileSync(pkg_path, 'utf8'));
        var main = info.browser || info.main || 'index.js';
        filename = path.resolve(base, main);
    };

    // the entry registered name will be the module name
    opt = merge({ name: name }, opt || {});

    return new Bundle(filename, opt);
};

