##  jsbundler ##
An automatic javascript file bundler for files written using the node.js require style for dependencies.

Although a few other similar projects exist in this space(browserify, brequest, jsbundle), the jsbundler codebase and client side code is very minimal. It leverages the builtin node module loader to track down your dependencies and generate the output.

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

### Browser Side ###

There are two components to the api, client side (browser) and server side (node.js).

Before you can src any require script files in your web app you will need to expose the client library. jsbundler exposes the raw source as well as provides connect compatible middleware for the client file.

Put the following before any other jsbundler generated files in your html

```html
  <script src="/path/to/require.js"></script>
```

Use the connect middleware to expose the require.js file

```javascript

// compress: true will use uglify-js to minify the client code
// url: is where the resource will be located
app.use(jsbundler.client.static({
    compress: true,
    url: '/path/to/require.js'
});
```

You can also access the client source directly

```javascript
// client source will be the javascript file source
var client_source = jsbundler.client.bundle();
```

Or if you really really want to do things your way, just get the location of the require.js file

```javascript
var full_path_to_require_js = jsbundler.client.filename;
```

### Server Side ###

To create a client bound javascript file from a local file use the basic bundle api call.

```javascript
// bundle will build the complete javascript source and inject dependencies
var bundle = jsbundler.bundle('/path/to/local/file.js');
```

