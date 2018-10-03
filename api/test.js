const _path = require("path");
const _api = require(_path.resolve("./index.js"));
console.log(_api.formMarkdown(_api.parseDirectory("")["index"], null, 1));
