# script [![Build Status](https://secure.travis-ci.org/shtylman/node-script.png?branch=master)](http://travis-ci.org/shtylman/node-script)

Use node.js modules in your client side scripts without thinking about it.

Dependency resolution and boilerplate is a job best left to a bundler and not a programmer. Script does all the heavy lifting to bundle your project files automatically with no additional build steps!

Script understands the simple commonjs require syntax to generate a single bundle or several bundles depending on your app caching requirements. This means you can use many node.js modules in the browser without any extra effort.

See the wiki for more details!

### What makes script different?

 * small overhead
 * no manual build steps
 * leverage browser caching through external bundles
 * shims for server only vs browser compat code

I hate having a build step and I also hate having to write boilerplate code just so my client side dependencies load right. One minor slip-up or misplaced script tag and nothing works! So I made script do the hard work for me.

## Installation

```
npm install script
```

## Usage

At the core, script will bundle up your javascript files or npm modules for rendering as a unified javascript file which can be used with the script client require.js file.

To make a bundle from a script file or module

```javascript

// create a bundle from a local file
var bundle = script.file('/path/to/local/file.js');

// create a bundle from a locally installed npm module
var bundle = script.module('cool-npm-moduel');

// rendering a bundle
bundle.render(function(err, source) {
  // if no error, source will be a string with all of the dependencies rolled into it
  console.log(source);
});
```

### connect/express middleware

Using the `script-middleware` package you can easily serve your script processed js files.

```javascript
var script_middleware = require('script-middleware);

// this will serve all javascript files through script automatically resolving dependencies
app.use(connect_script({
  // where to look for source files
  srcdir: __dirname + '/static/',

  // where to cache generated bundles
  cachedir: __dirname + '/static/cache/',

  // age in milliseconds of the resource
  max_age: 0,

  // if true, will compress with uglify-js (you will need to install it)
  compress: false;
});

See the script-middleawre docs for more information.

### advanced

While most users will be happy with the basic connect/express usage above, script is designed to fill complex app needs as well.

Most large scale apps use many javascript files. Some of these files are used on every page or act as "core" components. Instead of duplicating this code into every script bundle, script provides a way to create separate bundles for your core components. This allows you to better leverage browser caching between pages and further decreate the size of downloaded files.

An example (see examples/externals for the full source code):

Suppose you have a three files for your web app: core.js, page_a.js, page_b.js. core.js is required by all of your pages. When the user navigates from page_a to page_b, there is no need ot redownload the same core script.

```javascript
var core = script.file('/path/to/core.js');

// we will setup a page_a bundle referencing the core bundle
var page_a = script.file('/path/to/page_a.js', {
  // specify that core is a dependency of page_a bundle
  externals: [
    core
  ],
  // see the API description below for the following fields
  externals_url: function(cb) {
    cb(err, url);
  }
  main: true,
  client: true
});

// and similar for page_b
var page_b = script.file(...);
```

page_a.js nor page_b.js will not contain any code for core.js. Instead, they will make a request to fetch the code from the server (or from browser cache if applicable).

The only script your html page needs to have is the entry script (page_a or page_b) never core.js

```html
<script src="/route/to/page_a.js"></script>
```

### shims

Some modules contain compiled or server specific dependencies. These will not work on the client and must be replaced. Script allows you to easily shim out any dependency or require.

```javascript
var bundle = script.file('/path/to/page_a.js', {
  shims: {
    'ws': '/path/to/ws/shim.js'
  }
});
```

Now whenever sript encounters `require('ws')` it will make sure to avoid loading the server only module and instead load the file you specified.

The core node.js modules (events, http) are supported through this mechanism and will be shimmed for you automatically. Any shims you specify will override the defauls.

## cli ##

Instead of adding boilerplate to your source files for "client side usage", just use the script command line tool to generate distributed versions of your library with all of the dependencies bundled.

```
bundle --name "my_module" /path/to/entry/point.js
```

Script will load the javascript file at the specified path and bundle all of the dependencies into a single file. The entry point module will be exposed to a variable with the given name (i.e. my_module).

If you want to minify the output, just pass the ```--minify``` option and the output will be run through uglify-js.
