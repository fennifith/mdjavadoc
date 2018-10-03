'use strict';

const DEFAULT_SOURCE_PREFIX = "../blob/master";
const DEFAULT_REG = /^(?!\.).*/;

/**
 * Specifies a template for all of the tags ("@something")
 * in the parsed javadocs to use. These are useful for building
 * table layouts from the resulting data.
 */
const tags = {
	author: ["Name"],
	version: ["Current Version"],
	param: ["Parameter Name", "Description"],
	"return": ["Returned Value"],
	exception: ["Exception", "Description"],
	throws: ["Exception", "Description"],
	see: ["Reference"],
	link: ["Reference"],
	since: ["Version"],
	deprecated: ["Deprecation"]
};

const _path = require("path");
const _fs = require("fs");


/**
 * Generates a set of markdown docs from the files in a directory.
 * 
 * @param dir		The directory to generate the docs from.
 * @param out		The directory in which to place generated files.
 * @param options	Optional arguments.
 */
function generateMarkdownFiles(dir, out, options) {
	if (!options)
		options = {};

	if (!_fs.existsSync(_path.resolve(out))) {
		let paths = out.split("/");
		let path = [];
		for (let i in paths) {
			path.push(paths[i]);
			
			let resolved = _path.resolve(path.join("/"));
			if (!_fs.existsSync(resolved))
				_fs.mkdirSync(resolved);
		}
	}
	
	let data = parseDirectory(dir, null, options);
	generateMarkdownFilesRecursive(data, out, null, options);
}

function generateMarkdownFilesRecursive(data, out, prefix, options) {
	if (!options)
		options = {};

	for (let item in data) {
		if (Array.isArray(data[item])) {
			if (data[item].length > 0) {
				let path = out;
				if (prefix) {
					prefix.split(".").forEach((dir) => {
						path += "/" + dir;
						let resolved = _path.resolve(path);
						if (!_fs.existsSync(resolved))
							_fs.mkdirSync(resolved);
					});
				}
			
				_fs.writeFileSync(_path.resolve(path + "/" + (options.extensions ? item : item.split(".")[0]) + ".md"), formMarkdown(data[item], options));
			}
		} else generateMarkdownFilesRecursive(data[item], out, (prefix ? prefix + "." : "") + item, options);
	}
}

/**
 * Generates a markdown doc from the specified file.
 * 
 * @param file		The file to generate the docs from.
 * @param out		The file to output the markdown into.
 * @param options	Optional arguments.
 */
function generateMarkdownFile(file, out, options) {
	if (!options)
		options = {};
	
	let markdown = formMarkdown(parseFile(file, options.prefix, options), options);
	_fs.writeFileSync(_path.resolve(out), markdown);
}

/**
 * Form basic markdown from an array of parsed data.
 * 
 * @param data 		The parsed data (returned by {@link parseFile})
 * 					to generate markdown from.
 * @param options	Optional arguments.
 * @return 			A string of the markdown formatted docs.
 */
function formMarkdown(data, options) {
	if (!options)
		options = {};
		
	let markdown = "";
	
	for (let i in data) {
		if (data[i].type.includes("public") || !options.isPublic) {
			if (data[i].type.includes("class"))
				markdown += "# ";
			else markdown += "## ";
			markdown += "[" + data[i].name + "](" + data[i].source + ")" + "\n\n";
			
			if (data[i].type.length > 0)
				markdown += "**Type:** `" + data[i].type.join("` `") + "`\n\n";
			
			markdown += data[i].description + "\n";
			
			for (let tag in tags) {
				if (data[i][tag] && data[i][tag].length > 0) {
					let isTable = tags[tag].length > 1;
					if (isTable) {
						markdown += "\n|" + tags[tag].join("|") + "|\n";
						markdown += "|" + "-----|".repeat(tags[tag].length) + "\n";
					} else markdown += "\n**" + tags[tag][0] + ":** ";
					
					for (let item in data[i][tag]) {
						if (isTable)
							markdown += "|" + data[i][tag][item].values.join("|") + "|\n";
						else markdown += data[i][tag][item].values[0] + "\n\n";
					}
				}
			}

			markdown += "\n";
		}
	}
	
	return markdown;
}

/**
 * Parses docs for all of the files in a directory.
 * 
 * @param dir 		The starting directory to parse files from.
 * @param prefix 	Internally used prefix to append to package names.
 * @param reg		A regex statement to match file names to.
 * @return 			An array of the docs fetched from each file.
 */
function parseDirectory(dir, prefix, options) {	
	if (!options)
		options = {};
	if (!options.reg)
		options.reg = DEFAULT_REG;

	let object = {};
	_fs.readdirSync(_path.resolve(dir)).forEach((filename) => {
		if (options.reg === null || options.reg.test(filename)) {
			let stat = _fs.lstatSync(_path.resolve(dir + "/" + filename));
			if (stat.isDirectory())
				object[filename] = parseDirectory(dir + "/" + filename, (prefix ? prefix + "." : "") + filename, options);
			else if (stat.isFile())
				object[filename] = parseFile(dir + "/" + filename, prefix, options);
		}
	});
	
	return object;
}

/**
 * Parses the docs in a specific file. Docs are formatted
 * as follows:
 * 
 * ```javascript
 * {
 *   name: "methodName",
 *   description: "This method does a thing with something and somethingelse.",
 *   type: ["function"], // basically an array of anything that comes before the method name
 *   source: "/package/structure/ClassName.java#L247",
 *   param: [ // all tags are added to the map
 *     {
 *	     content: "@param something The thing for the stuff.",
 *       template: ["Parameter Name", "Description"],
 *       values: ["something", "The thing for the stuff."]
 *     },
 *     {
 *	     content: "@param somethingelse The other thing for the stuff.",
 *       template: ["Parameter Name", "Description"],
 *       values: ["somethingelse", "The thing for the stuff."]
 *     }
 *   ]
 * }
 * ```
 *
 * The full list of tags that are included in this object can
 * be found {@link #tags here}.
 * 
 * @param file 		The file to parse docs from.
 * @param prefix 	The prefix to add to the doc packages.
 * @param options	Optional arguments.
 * @return 			An array of the parsed docs for the file.
 */
function parseFile(file, prefix, options) {
	if (!prefix)
		prefix = "";
	if (!options)
		options = {};
	if (!options.sourcePrefix)
		options.sourcePrefix = DEFAULT_SOURCE_PREFIX;
	
	let docs = [];

	let fileNames = file.split("/");
	let fileName = fileNames[fileNames.length - 1];
	let content = _fs.readFileSync(_path.resolve(file), "utf8");
	let reg = /(?<=\/\*\*)([\s\S]*?)(?=\*\/)/g;
	let match;
	while ((match = reg.exec(content)) !== null) {
		let matchText = match[0].substring(match[0].indexOf("\n") + 1, match[0].lastIndexOf("\n"));

		let startIndex = match.index + match[0].length;
		startIndex += content.substring(startIndex).indexOf("\n") + 1;
		let declaration = content.substring(startIndex, startIndex + content.substring(startIndex).indexOf("\n"));
		declaration = (/([A-Z0-9a-z ]*)/g).exec(declaration)[1].trim().split(" ");
		
		let doc = {
			name: declaration.pop(),
			description: "",
			type: declaration,
			source: options.sourcePrefix + "/" + prefix.split(".").join("/") + "/" + fileName + "#L" + getLineNumber(content, match.index)
		};

		let tag = null;
		let lines = matchText.split("\n");
		for (let i in lines) {
			let line = lines[i].replace(/([ \t]){0,}(\*)( ){0,}/g, "");
			if (line.startsWith("@")) {
				let spaceIndex = line.search(/[ \t]/);
				tag = line.substring(1, spaceIndex);
				line = line.substring(spaceIndex + 1);
				let phrase = null;
				if (tags[tag]) {
					let object = {
						content: line,
						template: tags[tag],
						values: []
					};

					let words = line.split(/[ \t]{1,}/g);
					for (let word in words) {
						if (phrase) {
							if (words[word].endsWith("}")) {
								phrase.push(words[word].substring(0, words[word].length - 1));
								object.values[object.values.length - 1] += " " + parsePhrase(phrase, prefix, options.extensions ? fileName : fileName.split(".")[0]);
								phrase = null;
							} else {
								phrase.push(words[word]);
							}
						} else if (words[word].startsWith("{")) {
							phrase = [words[word].substring(1)];
						} else {
							if (object.values.length < tags[tag].length)
								object.values.push(words[word]);
							else object.values[object.values.length - 1] += " " + words[word];
						}
					}

					if (doc[tag])
						doc[tag].push(object);
					else doc[tag] = [object];
				} else tag = null;
			} else if (tag) {
				let object = doc[tag][doc[tag].length - 1];
				let words = line.split(/[ \t]{1,}/g);
				for (let word in words) {
					if (object.values.length < tags[tag].length)
						object.values.push(words[word]);
					else object.values[object.values.length - 1] += " " + words[word];
				}
			} else {
				if (line.trim().length > 0) {
					let words = line.trim().split(/[ \t]{1,}/g);					
					let phrase = null;
					for (let word in words) {
						if (phrase !== null) {
							if (words[word].includes("}")) {
								phrase.push(words[word].substring(0, words[word].indexOf("}")));
								doc.description += parsePhrase(phrase, prefix, options.extensions ? fileName : fileName.split(".")[0]) + words[word].substring(words[word].indexOf("}") + 1);
								phrase = null;
							} else {
								phrase.push(words[word]);
							}
						} else if (words[word].startsWith("{@")) {
							phrase = [words[word].substring(2)];
						} else {
							doc.description += words[word] + " ";
						}
					}
				}

				doc.description += "\n";
			}
		}

		docs.push(doc);
	}

	return docs;
}

/**
 * Parses an embedded tag (usually enclosed in brackets) and returns the
 * markdown-formatted result. This currently only works with "@see" and
 * "@link" tags. The URL of the formatted link is the similar as the format
 * used in the javadoc, making the returned value something like
 * `[this](package.name.api#parsePhrase)`.
 * 
 * @param phrase	An array of the values of the embedded tag, starting
 * 					with the tag name (excluding the @) and all of the following
 *                  embedded text split by whitespace.
 * @param prefix	The package prefix to append to urls.
 * @param fileName	The file name to append to urls.
 * @return 			A markdown link to append to stuff.
 */
function parsePhrase(phrase, prefix, fileName) {
	let tag = phrase.shift();
	if ((tag == "see" || tag == "link") && phrase.length == 2) {
		let strings = phrase.shift().split("#");
		let prefixes = [];
		if (strings[0].length > 0)
			prefixes = strings[0].split(".");
		else if (prefix && prefix.length > 0)
			prefixes = prefix.split(".");

		if (fileName)
			prefixes.push(fileName);
		
		return "[" + phrase.join(" ")  + "](" + prefixes.join("/") + "#" + strings[1] + ")";
	} else {
		phrase.shift();
		return phrase.join(" ");
	}
}

/**
 * Calculates the line number of the specified index in a string.
 *
 * @param content 	The full content of the file.
 * @param index 	The index of the character to get the line num of.
 * @return 			The line number of the specified index.
 */
function getLineNumber(content, index) {
	let line = 1;
	for (let i = 0; i < content.length && i <= index; i++) {
		if (content.charAt(i) == '\n')
			line++;
	}
	
	return line;
}

module.exports.parseDirectory = parseDirectory;
module.exports.parseFile = parseFile;
module.exports.formMarkdown = formMarkdown;
module.exports.generateMarkdownFile = generateMarkdownFile;
module.exports.generateMarkdownFiles = generateMarkdownFiles;