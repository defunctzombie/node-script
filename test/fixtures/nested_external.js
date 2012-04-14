/// external will be required inline but it contains an external dep
/// this should cause the main module to be wrapped with the proper loader
/// and wait

var ext = require('./external');
