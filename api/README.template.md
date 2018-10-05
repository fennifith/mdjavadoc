# Markdown JavaDoc API

The [`mdjavadoc-api`](https://www.npmjs.com/package/mdjavadoc-api) contains five methods, documented [below](#documentation). Information about the accepted parameters and the behavior of these functions can be found in the [project README](https://jfenn.me/redirects/?t=github&d=mdjavadoc).

### Installation

This is fairly simple.

```shell
npm install mdjavadoc-api
```

### Usage

Using the API in your application is pretty easy. For example, this program will parse the file "index.js" and output the resulting markdown to "out.md":

```javascript
const _mdjd = require('mdjavadoc-api');
_mdjd.generateMarkdownFile("index.js", "out.md");
```

Another example, this one simply parses "index.js" and prints the parsed data in the console:

```javascript
const _mdjd = require('mdjavadoc-api');
console.log(_mdjd.parseFile("index.js"));
```

#### Options

The `options` argument on each method is simply an object containing optional arguments which can change the result of the program. These options function as stated below:

| Option Name     | Type             | Description |
|-----------------|------------------|-------------|
| template        | file (string)    | Uses the file as a template to generate markdown, replacing occurences of `{{ content }}` with the generated docs. |
| reg             | RegExp           | A regular expression to filter out unwanted files (defaults to `/^(?!\.).*/`, or "any file that does not begin with a `.`"). |
| regdir          | RegExp           | `reg` but for directories. |
| extensions      | boolean          | Whether to include the file extensions in the generated content (setting this to true will name files "ClassName.java.md" instead of just "ClassName.md") |
| sourcePrefix    | string           | A string to start all source code URLs with. Defaults to "..". For example, a link to "/api/index.js#L50" will become "../api/index.js#L50". |
| breadcrumbs     | boolean          | Whether to add "breadcrumbs" to the top of each file for navigation. |
| breadcrumbsChar | string           | The character to separate breadcrumbs with - defaults to " > ". |
| index           | boolean / string | Whether to generate an index file containing all of the generated docs, and (optionally) the name of the file - defaults to "README.md". By default, this option also generates files for internal directories which look into a smaller amount of folders specified by `indexLength`. |
| indexLength     | integer          | How many directories internal index files should look into - defaults to 3. Setting this value to 0 disables index files for internal directories. |
| indexExtensions | boolean          | Whether to include file extensions (.md, etc) in index files. |
| indexTemplate   | file (string)    | A `template` but for index files. Works almost exactly the same way. |

# Documentation

Yes, this program has written its own documentation.


{{ content }}
