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
| breadcrumbsChar | string           | The character to separate breadcrumbs with - defaults to ">". |
| index           | boolean / string | Whether to generate an index file containing all of the generated docs, and (optionally) the name of the file - defaults to "README.md". By default, this option also generates files for internal directories which look into a smaller amount of folders specified by `indexLength`. |
| indexLength     | integer          | How many directories internal index files should look into - defaults to 3. Setting this value to 0 disables index files for internal directories. |
| isPublic        | boolean          | Whether to ignore javadocs for non-public methods/fields/whatever. |

# Documentation

Yes, this program has written its own documentation.

## [setTag](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L26)

**Type:** `function`

Change the template for one of the preset tags. The 
default tags are defined as: 

- author: ["Name"] 
- version: ["Current Version"] 
- param: ["Parameter Name", "Description"] 
- "return": ["Returned Value"] 
- exception: ["Exception", "Description"] 
- throws: ["Exception", "Description"] 
- see: ["Reference"] 
- link: ["Reference"] 
- since: ["Version"] 
- deprecated: ["Deprecation"] 



|Parameter Name|Description|
|-----|-----|
|tag|The name of the tag (without the leading '@').|
|template|The template to use for the tag (a string array).|

**Returned Value:**  An object containing all of the current tags. 


## [generateMarkdownFiles](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L51)

**Type:** `function`

Generates a set of markdown docs from the files in a directory. 



|Parameter Name|Description|
|-----|-----|
|dir|The directory to generate the docs from.|
|out|The directory in which to place generated files.|
|options|Optional arguments. |

## [generateMarkdownFile](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L139)

**Type:** `function`

Generates a markdown doc from the specified file. 



|Parameter Name|Description|
|-----|-----|
|file|The file to generate the docs from.|
|out|The file to output the markdown into.|
|options|Optional arguments. |

## [formMarkdown](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L154)

**Type:** `function`

Form basic markdown from an array of parsed data. 



|Parameter Name|Description|
|-----|-----|
|data|The parsed data (returned by [parseFile](#parseFile)) to generate markdown from.|
|options|Optional arguments.|

**Returned Value:**  A string of the markdown formatted docs. 


## [parseDirectory](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L272)

**Type:** `function`

Parses docs for all of the files in a directory. 



|Parameter Name|Description|
|-----|-----|
|dir|The starting directory to parse files from.|
|prefix|Internally used prefix to append to package names.|
|reg|A regex statement to match file names to.|

**Returned Value:**  An array of the docs fetched from each file. 


## [parseFile](https://github.com/TheAndroidMaster/mdjavadoc/blob/master/api//index.js#L300)

**Type:** `function`

Parses the docs in a specific file. Docs are formatted 
as follows: 

```javascript 
{ 
name: "methodName", 
description: "This method does a thing with something and somethingelse.", 
type: ["function"], // basically an array of anything that comes before the method name 
source: "/package/structure/ClassName.java#L247", 
param: [ // all tags are added to the map 
{ 
content: "@param something The thing for the stuff.", 
template: ["Parameter Name", "Description"], 
values: ["something", "The thing for the stuff."] 
}, 
{ 
content: "@param somethingelse The other thing for the stuff.", 
template: ["Parameter Name", "Description"], 
values: ["somethingelse", "The thing for the stuff."] 
} 
] 
} 
``` 



|Parameter Name|Description|
|-----|-----|
|file|The file to parse docs from.|
|prefix|The prefix to add to the doc packages.|
|options|Optional arguments.|

**Returned Value:**  An array of the parsed docs for the file. 


