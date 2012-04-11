jsbundler is an automatic javascript file bundler for files written using the node.js require style for dependencies.

Although a few other similar projects exist in this space(browserify, brequest, jsbundle), the jsbundler codebase and client side code is very minimal. It leverages the builtin node module loader to track down your dependencies and generate the output.
