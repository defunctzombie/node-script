var fs = require('fs');
var connect = require('connect');
var script = require('../');

var app = connect();

// simplest way to use script is to just bundle everything into one file
// use .middleware to get connect compatible middleware
app.use('/js/basic.js', script.bundle(__dirname + '/public/basic.js').middleware());

// here we show how to use the external module features
// external.js will require('core') but we serve core as a separate file
app.use('/js/external.js', script.bundle({
    src: __dirname + '/public/external.js',
    use_client: true,
    external: {
        'core': '/js/core.js',
    }
}).middleware());

// we must remember to server any separate files as well
// here we serve core since it was used by the external script above
app.use('/js/core.js', script.bundle({
    src: __dirname + '/public/core.js',
}).middleware());

// serve up anything else (our example html files)
app.use(connect.static(__dirname + '/public'));

// handle index specially
app.use('/', function(req, res) {
    res.end(fs.readFileSync(__dirname + '/public/index.html'));
});

app.listen(8000);
