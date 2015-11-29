![typhonjs-config-jspm-parse](http://i.imgur.com/juoSdh4.png)

[![NPM](https://img.shields.io/npm/v/typhonjs-config-jspm-parse.svg?label=npm)](https://www.npmjs.com/package/typhonjs-config-jspm-parse)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat)](https://github.com/typhonjs/typhonjs-core-gulptasks/blob/master/LICENSE)

[![Build Status](https://travis-ci.org/typhonjs/typhonjs-config-jspm-parse.svg?branch=master)](https://travis-ci.org/typhonjs/typhonjs-config-jspm-parse)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs/typhonjs-config-jspm-parse.svg)](https://codecov.io/github/typhonjs/typhonjs-config-jspm-parse)
[![Dependency Status](https://www.versioneye.com/user/projects/565a739b036c320027000008/badge.svg?style=flat)](https://www.versioneye.com/user/projects/565a739b036c320027000008)

Provides several utility functions to parse JSPM packages and find normalized paths
from `package.json` and `config.js` using an instance of System / SystemJS Loader. This npm module works in the
Node execution environment and the browser. The following functions are available:

- `getPackageResolver` - Returns an instance of PackageResolver which provides all top level (topLevelPackages) and
child package (childPackageMap) dependencies. An optional `packageFilter` parameter which is an array of strings will
limit the resolver to specifically those top level packages. Additional methods: `getDirectDependency`,
`getDirectDependencyMap` & `getUniqueDependencyList` provide functionality to respectively return
a specific direct child dependency, the direct child dependency map, or an array of all child dependencies.

- `getRootPath` - Returns the root execution path.

- `getTopLevelDependencies` - Returns all top level package dependencies and devDependencies. If `jspmPackages` is
defined only the keys of `jspmPackages` will be resolved.

- `parseChildDependencies` - Provides a map of all child dependencies defined in `config.js` / `System.packages`.
`System.packages` stores the mapped dependency paths by a `file://` reference, but we actually want the mapped paths
for the package. This function parses `System.packages` converting the entries into the desired format.

- `parseNormalizedPackage` - Attempts to normalize and parse a packageName returning `null` if it is an invalid package
or an object hash
containing the parsed package details. Note: Only works in the Node execution environment.

To install: `npm install typhonjs-config-jspm-parse`

For instance in specifying further user defined mapped paths in additional config loading here is an example
from backbone-parse-es6-todos that maps a source file from a child dependency of `backbone`
(https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/config/config-app-paths.js):
```
var System = System || global.System;

var JSPMParser = JSPMParser || (typeof require !== 'undefined' ? require('typhonjs-config-jspm-parse') : undefined);

var packageResolver = JSPMParser.getPackageResolver(System);
var pathBackboneCommon = packageResolver.getDirectDependency('backbone', 'typhonjs-backbone-common');

System.config(
{
   map:
   {
      'mainEventbus': pathBackboneCommon + '/src/mainEventbus.js',
   }
});
```

In the case of running in the browser load the `typhonjs-config-jspm-parse` before usage.
```
<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script src="node_modules/typhonjs-config-jspm-parse/src/parser.js"></script>
<script src="config/config-app-paths.js"></script>
<script>System.import('main.js');</script>
```

Please see `package.json` and the `jspm` entries from `backbone-parse-es6-todos`:
https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/package.json

In this case `backbone` is mapped to `github:typhonjs/backbone-parse-es6@master`

The above code example searches for the mapped package `typhonjs-backbone-common` which is mapped
in the `package.json` of `github:typhonjs/backbone-parse-es6@master`:
https://github.com/typhonjs/backbone-parse-es6/blob/master/package.json
