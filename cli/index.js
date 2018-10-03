#!/usr/bin/env node
'use strict';

const _path = require('path');
const _program = require('commander');
const _api = require(_path.resolve("../api/index.js"));

_program.version("1.0.0", '-v --version')
	.option('-o --output [path]', "location to store generated files in")
	.option('-f --file [file]', "a specific file to parse")
	.option('--filter [expression]', "file name filter")
	.option('--prefix [url]', "source code prefix")
	.option('-e --extensions', "generate files with extensions");

_program.parse(process.argv);

if (_program.file) {
	_api.generateMarkdownFile(_program.file, _program.output ? _program.output : (_program.extensions ? _program.file : _program.file.split(".")[0]) + ".md", {
		sourcePrefix: _program.prefix,
		extensions: _program.extensions
	});
} else {
	_api.generateMarkdownFiles(".", _program.output ? _program.output : "docs", {
		reg: new RegExp(_program.filter),
		sourcePrefix: _program.prefix,
		extensions: _program.extensions
	});
}
