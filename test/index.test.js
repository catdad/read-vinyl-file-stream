/* jshint node: true, mocha: true */

var expect = require('chai').expect;

var File = require('vinyl');
var ns = require('node-stream');
var through = require('through2');

var readFiles = require('../');

function file(opts) {
    opts = opts || {};

    return new File({
        contents: new Buffer(opts.content || 'fake file'),
        path: opts.path || Math.random().toString(36).slice(2) + '.txt',
        base: __dirname
    });
}

describe('[index]', function () {
    it('iterates all files', function (done) {
        var input = through.obj();
        var CONTENT = Math.random().toString(36);

        var count = 0;

        var output = input.pipe(readFiles(function (content, file, memo, cb) {
            count += 1;

            expect(content).to.equal(CONTENT);

            cb();
        }, ''));

        ns.wait.obj(output, function (err, data) {
            expect(err).to.equal(null);
            expect(data).to.be.an('array').and.to.have.lengthOf(0);

            expect(count).to.equal(3);

            done();
        });

        input.push(file({
            content: CONTENT
        }));
        input.push(file({
            content: CONTENT
        }));
        input.push(file({
            content: CONTENT
        }));
        input.end();
    });
});
