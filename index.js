
var bundle = require('./lib/bundler');

/// creates a bundle from a file
module.exports.file = bundle.file;

/// create a bundle from a module name
module.exports.module = bundle.module;

/// client code setup
module.exports.client = require('./client');

// expose the Bundle class (returned from the bundle call)
module.exports.Bundle = bundle.Bundle;

