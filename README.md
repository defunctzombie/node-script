## script [![Build Status](https://secure.travis-ci.org/shtylman/node-script.png?branch=master)](http://travis-ci.org/shtylman/node-script)##

Wouldn't it be nice to just have one script tag in your html file and have everything "just work"? Well, script does just that!

Script is an automatic javascript file bundler and middleware for files written using the node.js require style for dependencies. It also supports for async loading of external resources for better cache separation; and it does all that without changing how you require modules in your js files.

Although a few other similar projects exist in this space(browserify, jsbundle, brequire, etc), the script codebase and client side code is very minimal. It leverages the builtin node module loader to track down your dependencies and generate the output. It also support the concept on async loading and separating your bundles for better caching.

### Installation ###

From npm

```
npm install script
```

### Usage ###

Using script is super simple and it works out of the box with connect (and connect based apps).

```javascript
var script = require('script');

var bundle = script.bundle('/path/to/your/file.js')
app.use('/route/to/your/file.js', bundle.middleware({
  // age in milliseconds of the resource
  max_age: 0,
  // if true, will cache the bundle in memory
  cache: false,
  // if true, will compress with uglify-js (you will need to install it)
  compress: false,
});

```

This is not the only way to use script, read on for a more detailed breakdown.

### Details ###

There are two components to the api: the emulation of the `require` function and wrapping of your modules for loading on the browser.

The emulation of the `require` function is done through the require.js file located in the client folder in the source tree. It is exposed through the script module.

In the default single file mode (shown above in the middleware example), the client code is generated with your bundle and your main module will be run automatically. You can however choose to send that file to the client separately if you wish to have a few js bundle files.

#### require.js emulation file ####

The location of the client file on disk is exposed through the client.filename variable;

```javascript
var full_path_to_require_js = script.client.filename;
```

You can also get a copy of the client source

```javascript
// client source will be the javascript file source
var client_source = script.client.toString();
```

You can serve this file yourself and put the following before any other script generated files in your html

```html
<script src="/route/to/require.js"></script>
```

#### multiple bundles ####

Lets say you have a large library with many components. You may not want to ship one giant file to the client and instead favor to split the library up for better caching. script can handle this for you and will automatically load any external resources before making your module available.

To create multiple bundles, just pass an options object instead of a string to the bundle api call. The options will specify how your bundle is created.

```javascript
var script = require('script');

var foobar = script.bundle({
  src: '/path/to/base/foobar.js',
  // the module name, if omitted, basename of filename is used (i.e. foobar)
  name: 'foobar',
  use_client: true, // include the require.js source with this file
  external: {
    // this tells the bundler that widgets should not be resolved immediately
    // but instead loaded from the given url when foobar itself is loaded
    'widgets': '/route/to/widgets.js',
  }

  // shims allow you to replace 3rd party modules during bundling
  //shims: {
  //  'process': '/path/to/process/shim.js'
  //},
});

// assume widgets has good api stability and rarely changes
// we may want the client to cache it longer and thus separate it from foobar
var widgets = script.bundle({
  src: '/path/to/widgets/file.js',
  name: 'widgets',
});

// the middleware methods are still available if you want to use them to serve up the modules
//foobar.middleware({..});
//widgets.middleware({..});

// you can also get the bundle source using toString();
//foobar.toString(); // the source for the foobar bundle
```

You now just have to specify one file in your html and the rest is automatially loaded for you if needed.

```html
<script src="/route/to/foobar.js"></script>
```

foobar.js will not contain any code for the widgets module and will instead request it from `/route/to/widgets.js` before executing the foobar module code.

### cli ###

The cli tool allows you to bundle up your package for others to use client side without needing to use script or other automatic bundlers. This is useful if you don't work in a node.js environment and want to make distributed versions of your library.

```
bundle --name "my_module" ./path/to/entry/point.js
```

Script will load the javascript file at the specified path and bundle all of the dependencies into a single file. The entry point module will be exposed to a variable with the given name (i.e. my_module).

If you want to minify the output, just pass the ```--minify``` option and the output will be run through uglify-js.
