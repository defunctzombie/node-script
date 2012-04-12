
/// creates a new bundle
module.exports.bundle = require('./lib/bundler');

/// client code setup
module.exports.client = require('./client');

// expose the Bundle class (returned from the bundle call)
module.exports.Bundle = require('./lib/bundler').Bundle;

