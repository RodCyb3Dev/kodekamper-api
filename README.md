#### Use Import Instead of Require in Node App

To `package.json` add "type": "module"

````json
{
  "name": "esm-modules",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1"
  },
  "type": "module"
}```
````
