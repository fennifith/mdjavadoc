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

	let content = _fs.readSync(_path.resolve(file));
	let reg = /(\/\*\*)([A-Z0-9a-z@#\*\\\/\s\n\t]){0,}(\*\/)/g
	let match;
	while ((match = reg.exec(content)) !== null) {
		let doc = {
			source: prefix.split(".").join("/") + "/" + file + "#L" + getLineNumber(content, match.index)
		};
		
		for (let i in match[2].split(\n)) {
			
		}
	}
}

/**
 * Calculates the line number of the specified index in a string.
 *
 * @param content The full content of the file.
 * @param index The index of the character to get the line num of.
 * @return The line number of the specified index.
 */
function getLineNumber(content, index) {
	let line = 0;
	for (let i = 0; i < content.length && i <= index; i++) {
		if (content.charAt(i) == '\n')
			line++;
	}
	
	return line;
}
