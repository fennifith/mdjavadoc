const _path = require("path");
const _api = require(_path.resolve("./api/index.js"));
console.log(_api.generateMarkdownFiles("./", "sample/output"));
