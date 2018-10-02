const tags = {
	author: ["Name"],
	version: ["Current Version"],
	param: ["Parameter Name", "Description"],
	"return": ["Return Value"],
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
 * Parses docs for all of the files in a directory.
 * 
 * @param dir The starting directory to generate files from.
 * @param prefix Internally used prefix to append to package names.
 * @return An array of the docs fetched from each file.
 */
function parseDirectory(dir, prefix) {
	
}

/**
 * Parses the docs in a specific file. Docs are formatted
 * as follows:
 * 
 * ```javascript
 * {
 *   name: "methodName",
 *   description: "This method does a thing with something and somethingelse.",
 *   type: "method", // either "field", "method", "class", or "interface",
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
 * @param file The file to parse docs from.
 * @param prefix The prefix to add to the doc packages.
 * @return An array of the parsed docs for the file.
 */
function parseFile(file, prefix) {
	if (!prefix)
		prefix = "";
	
	let docs = [];

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
			source: prefix.split(".").join("/") + "/" + file + "#L" + getLineNumber(content, match.index)
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
								// TODO: parse phrase
								phrase = null;
							} else {
								phrase.push(words[word]);
							}
						} else if (words[word].startsWith("{")) {
							phrase = [words[word]];
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
				if (line.trim().length == 0)
					doc.description += "\n";
				else {
					doc.description += line.trim() + " ";
					newline = false;
				}
			}
		}

		docs.push(doc);
	}

	return docs;
}

/**
 * Calculates the line number of the specified index in a string.
 *
 * @param content The full content of the file.
 * @param index The index of the character to get the line num of.
 * @return The line number of the specified index.
 */
function getLineNumber(content, index) {
	let line = 1;
	for (let i = 0; i < content.length && i <= index; i++) {
		if (content.charAt(i) == '\n')
			line++;
	}
	
	return line;
}
