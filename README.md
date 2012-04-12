##  jsbundler ##
An automatic javascript file bundler for files written using the node.js require style for dependencies.

Although a few other similar projects exist in this space(browserify, jsbundle, etc), the jsbundler codebase and client side code is very minimal. It leverages the builtin node module loader to track down your dependencies and generate the output.

For example, the client bound require.js file is under 300 bytes after minification!

### Installation ###

From npm

```
npm install jsbundler
```

From github

```
npm install git://github.com/shtylman/node-jsbundler.git
```

### Usage ###

Using jsbundler is super simple and it works out of the box with connect (and connect based apps).

```javascript
var jsbundler = require('jsbundler');

var bundle = jsbundler.bundle('/path/to/your/file.js')
app.use('/route/to/your/file.js', bundle.middleware({
  // age in milliseconds of the resource
  max_age: 0,
  // if true, will cache the bundle in memory
  cache: false,
  // if true, will compress with uglify-js (you will need to install it)
  compress: false,
});

```

This is not the only way to use jsbundler, read on for a more detailed breakdown.

### Details ###

There are two components to the api: the emulation of the `require` function and wrapping of your modules for loading on the browser.

The emulation of the `require` function is done through the require.js file located in the client folder in the source tree. It is exposed through the jsbundler module.

In the default single file mode (shown above in the middleware example), the client code is generated with your bundle and your main module will be run automatically. You can however choose to send that file to the client separately if you wish to have a few js bundle files.

#### require.js emulation file ####

The location of the client file on disk is exposed through the client.filename variable;

```javascript
var full_path_to_require_js = jsbundler.client.filename;
```

You can also get a copy of the client source

```javascript
// client source will be the javascript file source
var client_source = jsbundler.client.toString();
```

You can serve this file yourself and put the following before any other jsbundler generated files in your html

```html
<script src="/route/to/require.js"></script>
```

#### multiple bundles ####

Instead of using a single file, you can choose to create separate bundles without the require.js emulation file. This allows you to pick and choose how you want to serve up files to the user. To trigger this mode, just pass an object as the argument to `jsbundler.bundle` instead of a string.

```javascript
var jsbundler = require('jsbundler');

var foobar = jsbundler.bundle({
  src: '/path/to/base/file.js',
  name: 'foobar'
});

var widgets = jsbundler.bundle({
  src: '/path/to/widgets/file.js',
  name: 'widgets'
  //auto_load: true // can be used to automatically require the module on script execution
});

// the middleware methods are still available
//foobar.middleware({..});
//widgets.middleware({..});
```

You now have two js bundles which contain 'foobar' and 'widgets' modules respectively. To invoke them from the client side you could do:

```html
<script src="/route/to/require.js"></script>
<script src="/route/to/foobar.js"></script>
<script src="/route/to/widgets.js"></script>
<script>
  var widgets = require('widgets');
  var foobar = require('foobar');
</script>
```

NOTE: if widgets and foobar require the same module, that module will ship with both packages currently. Inter bundle dependency resolution is not currently availalbe.

