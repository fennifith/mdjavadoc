const _path = require("path");
const _api = require(_path.resolve("./index.js"));
console.log(_api.generateMarkdownFiles("teststructure", "testoutput"));
