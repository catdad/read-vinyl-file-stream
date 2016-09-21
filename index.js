/* jshint node: true */

var path = require('path');

var through = require('through2');
var ns = require('node-stream');

var encodings = ['utf8', 'utf-8', 'buffer'];
var defaultEnc = 'utf8';

function castData(data, enc) {
    var isBuffer = Buffer.isBuffer(data);

    if (enc === 'buffer') {
        return isBuffer ? data : (new Buffer(data));
    } else {
        return isBuffer ? data.toString(enc) : data;
    }
}

module.exports = function iterateStream(iterator, enc) {
    var stream = through.obj(function (file, fileEnc, cb) {

        // continue if the file is null
        if (file.isNull()) {
            return cb();
        }

        var filepath = file.path || file.history[0];
        var name = path.basename(filepath);

        var content;

        function iteratorCallback(err, content) {
            if (err) {
                return cb(err);
            }

            if (content !== undefined) {
                stream.push(content);
            }

            cb();
        }

        if (file.isStream()) {
            file.contents.pipe(ns.wait(function(err, data) {
                data = castData(data, enc);
                iterator(data, file, stream, iteratorCallback);
            }));
        } else if (file.isBuffer()) {
            content = castData(file.contents, enc);
            iterator(content, file, stream, iteratorCallback);
        } else {
            // not sure what else it could be, but just deal with it
            cb();
        }
    });

    return stream;
};
