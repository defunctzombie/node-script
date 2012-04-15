
module.exports.write = function(msg) {
    $('#notes').append('<span>' + msg + '</span><br/>');
}

module.exports.write('1) core module loaded');

