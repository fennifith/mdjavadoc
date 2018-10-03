const _path = require("path");
const _api = require(_path.resolve("./index.js"));
console.log(JSON.stringify(_api.parseDirectory(""), null, 1));
