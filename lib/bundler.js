
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
    'events': require.resolve('events-browserify'),
    'http': require.resolve('http-browserify'),
};

var Bundle = function(filename, opt) {
    var self = this;

    opt = opt || {};

    self._entry = filename;

    // safe to prefix using 'script/entry.base_filename.js'
    // this will prevent conflict as it is namespaced under script
    self.name = opt.name || ('script/main.' + path.basename(filename));

    // external bundles
    // we do not generate output for these
    self._externals = opt.externals || [];

    self._extern_url = opt.externals_url;

    self._main = opt.main || false;
    self._client = opt.client || false;

    // a shim is 'name' -> '/path/to/file.js'
    // merge user shims over default shims
    self._shims = merge(k_default_shims, opt.shims || {});
}

Bundle.prototype.prepend = function(str) {
};

Bundle.prototype.append = function(str) {
};

// ?
//bundle.generate_stream(); //generates the bundle into a stream
//bundle.generate(function() ...) // generates the bundle into a callback

// generate the bundled string
Bundle.prototype.generate = function(cb) {
    var self = this;

    // TODO stream
    var out = '(function(require) {\n';

    var wait_externals = [];

    // url of externals to load
    var load_externals = [];

    var url_gen = self._extern_url;

    var finish = function() { self.resolve(function(err, result) {
        if (err) {
            return cb(err);
        }

        var deps = result.deps;
        var aliases = result.aliases;

        aliases.forEach(function(alias) {
            // map the new short name to an already loaded name
            out += 'require.alias(\'' + alias.name + '\', \'' + alias.alias + '\');\n';
        });

        (function next() {
            var dep = deps.shift();
            if (!dep) {

                fs.readFile(self._entry, 'utf8', function(err, source) {
                    if (err) {
                        return cb(err);
                    }

                    // wrap if something to wait on
                    if (wait_externals.length > 0) {
                        // TODO quotes for strings
                        out += 'require.wait([' + wait_externals.join(',') + '], function() {\n';
                    }

                    out += 'require.define(\'' + self.name + '\', \'\', ';
                    out += 'function(global, module, exports, require, process, __filename, __dirname) {\n';
                    out += source;
                    out += '\n});\n\n';

                    // main should be required from within loading block
                    // to ensure everything has been loaded
                    if (self._main) {
                        out += 'require(\'' + self.name + '\');\n';
                    }

                    // end wait wrapping
                    if (wait_externals.length > 0) {
                        out += '});\n';
                    }

                    // load externals last!
                    load_externals.forEach(function(url) {
                        // add to list of extern modules to load
                        out += 'require.load(\''+ url + '\');\n';
                    });

                    // close the whole closure
                    out += '})(require);\n';

                    return cb(null, out);

                });

                return;
            }

            // dependency is a native
            // load content directly
            if (dep.native) {
                out += 'require.define(\'' + dep.name + '\', \'' + dep.offset + '\', ';
                out += 'function(global, module, exports, require, process, __filename, __dirname) {\n';
                out += natives[dep.name];
                out += '\n});\n\n';

                return next();
            }

            // run through and externals we depend on directly
            // and see if we can further remove dependencies

            var external = self.external(dep.filename);
            // external just gives us the bundle which can contain out dependency
            // we must then get the name the dependency will be registered under
            //
            // what if modA is in an external, but we don't want to load from the external?
            // then we should not have specified it as external?
            //
            // if an external is not depended upon directly, then it should not cause itself to be brought in
            // if we have externals A and B and both of them depend on C
            // we also depend on C, but not on A or B
            // then use C directly and neither A nor B
            //
            // the above is true if the user is letting us manage loading externals and dependencies for them
            // what if they want to hard code them into their webpage?
            // then it would be more correct to not bring in C since they would have included A or B into the site
            // but really, then A and B need to know about one another to not duplicate C between the two...
            // but then which one depends on which?
            // this gets complex too quickly
            // is it really so bad to load the externals after initial script load?
            //
            if (external) {
                var alias = external.alias(dep.filename);

                // alias the id to the name which will be registered in the external
                if (dep.name !== alias) {
                    out += 'require.alias(\'' + dep.name + '\', \'' + alias + '\');\n';
                }

                // add external to list of modules to wait before registering our entry
                wait_externals.push(external.name);

                // assume user will load the file manually
                if (!url_gen) {
                    return next();
                }

                url_gen(function(err, url) {
                    if (err) {
                        return cb(err);
                    }

                    load_externals.push(url);
                    next();
                });

                return;
            }

            fs.readFile(dep.filename, 'utf8', function(err, source) {
                if (err) {
                    return cb(err);
                }

                out += 'require.define(\'' + dep.name + '\', \'' + dep.offset + '\', ';
                out += 'function(global, module, exports, require, process, __filename, __dirname) {\n';
                out += source;
                out += '\n});\n\n';

                next();
            });
        })();
    });
    };

    var externals = self._externals;
    var count = 0;
    (function next() {
        if (count >= externals.length) {
            return finish();
        }

        var external = externals[count++];
        external.resolve(function(err) {
            if (err) {
                return cb(err);
            }

            next();
        });
    })();
};

/// TODO should be recursive since having our externals contain a file
/// is the same to us as having their externals contain the file
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

Bundle.prototype.alias = function(filename) {
    return this._aliases[filename];
};

Bundle.prototype.resolve = function(cb) {
    var self = this;

    var filename = self._entry;

    // basepath is used to create the aliases for path lookup
    var basepath = path.dirname(filename);

    // the entry file is special
    var entry_filename = filename;

    var shims = self._shims;

    required(filename, function(err, deps) {
        if (err) {
            return cb(err);
        }

        shim(deps, shims, function(err) {
            if (err) {
                return cb(err);
            }

            var seen = {};

            // will be the final array of things to load
            var final = [];

            // aliases maps full path to short module name
            var aliases = {};

            // exported aliases
            var _aliases = [];

            var entry_name = self.name;

            /*
            final.push({
                name: entry_name,
                offset: '',
                filename: entry_filename
            });
            */

            seen[entry_filename] = true;

            // an alias back to the entry allows for children who require it
            // to be able to reference it correctly
            aliases[entry_filename] = entry_name;

            // add the dependencies
            (function next(deps, prev_offset) {
                deps.forEach(function(dep) {

                    var id = dep.id
                    var full_path = dep.filename;

                    if (seen[full_path || id]) {
                        return;
                    }
                    seen[full_path || id] = true;

                    // id must include previous offset
                    if (prev_offset) {
                        id = prev_offset + id;
                    }

                    var dirname = path.dirname(dep.filename);
                    var relative = path.relative(basepath, dirname);

                    var offset = '';
                    if (relative.length > 0) {
                        //offset for this dependency
                        offset = relative + '/';
                    }

                    var alias = aliases[full_path];
                    if (!alias) {
                        aliases[full_path] = id;
                    }

                    var val = {
                        name: id,
                        offset: offset,
                        filename: full_path,
                        native: dep.native || false
                    };

                    if (dep.native) {
                        val.name = dep.id;
                    }

                    final.push(val);

                    var alias = aliases[full_path];
                    if (alias && alias !== id) {
                        // exported aliases
                        _aliases.push({
                            name: id,
                            alias: alias,
                        });
                    }

                    if (dep.deps) {
                        next(dep.deps, offset);
                    }
                });
            })(deps);

            self._aliases = aliases;
            self._deps = final;

            cb(null, {
                deps: final,
                aliases: _aliases
            });
        });
    });
};

// take a set of deps and replace with any shims
function shim(deps, shims, cb) {
    (function recurse(deps, cb) {

        if (!deps || deps.length === 0) {
            return cb(null);
        }

        var count = 0;

        // loop deps
        // see if we need to keep each one
        (function next() {
            if (count >= deps.length) {
                return cb(null);
            }

            var dep = deps[count++];
            if (dep.seen) {
                return cb(null);
            }

            dep.seen = true;

            // this will be called at the final dep
            var shim_filename = shims[dep.id];

            if (shim_filename) {
                required(shim_filename, function(err, shim_deps) {
                    if (err) {
                        return cb(err);
                    }

                    dep.filename = shim_filename;
                    dep.deps = shim_deps;
                    dep.native = false;
                    next();
                });

                return;
            }

            recurse(dep.deps, function(err) {
                if (err) {
                    return cb(err);
                }

                delete dep.seen;
                next();
            });
        })();
    })(deps, cb);
};

module.exports.Bundle = Bundle;

// .file(/path/to/local/file, opt);
module.exports.file = function(filename, opt) {
    return new Bundle(filename, opt);
};

// .module('some-module', opt);
module.exports.module = function(name, opt) {

    var filename = require.resolve(name);

    // the entry registered name will be the module name
    opt = merge({ name: name }, opt || {});

    return new Bundle(filename, opt);
};

