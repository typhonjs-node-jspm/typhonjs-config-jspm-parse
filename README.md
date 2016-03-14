![typhonjs-config-jspm-parse](http://i.imgur.com/juoSdh4.png)

[![NPM](https://img.shields.io/npm/v/typhonjs-config-jspm-parse.svg?label=npm)](https://www.npmjs.com/package/typhonjs-config-jspm-parse)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/LICENSE)
[![Gitter](https://img.shields.io/gitter/room/typhonjs/TyphonJS.svg)](https://gitter.im/typhonjs/TyphonJS)

[![Build Status](https://travis-ci.org/typhonjs-node-jspm/typhonjs-config-jspm-parse.svg?branch=master)](https://travis-ci.org/typhonjs-node-jspm/typhonjs-config-jspm-parse)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-node-jspm/typhonjs-config-jspm-parse.svg)](https://codecov.io/github/typhonjs-node-jspm/typhonjs-config-jspm-parse)
[![Dependency Status](https://www.versioneye.com/user/projects/56ddc9524839f70035207c1a/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56ddc9524839f70035207c1a)

Provides several utility functions to parse [JSPM](http://jspm.io/) packages and find normalized paths
from `package.json` and `config.js` using an instance of [System / SystemJS](https://github.com/systemjs/systemjs) Loader. This npm module works in the
Node execution environment and the browser. The following functions are available:

- [getPackageJSPMDependencies](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L90) - Parses the packageObj / top level package.json for the JSPM entry to index JSPM dependencies. If an existing `jspmPackageMap` object hash exists then only the keys in that hash are resolved against `jspm.dependencies` entry in `package.json`.

- [getPackageJSPMDevDependencies](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L149) - Parses the packageObj / top level package.json for the JSPM entry to index JSPM devDependencies. If an existing `jspmPackageMap` object hash exists then only the keys in that hash are resolved against `jspm.devDependencies` entry in `package.json`.

- [getPackageResolver](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L208)- Returns an instance of PackageResolver which provides all top level (topLevelPackages) and
child package (childPackageMap) dependencies. An optional `packageFilter` parameter which is an array of strings will
limit the resolver to specifically those top level packages. Additional methods: `getDirectDependency`,
`getDirectDependencyMap` & `getUniqueDependencyList` provide functionality to respectively return
a specific direct child dependency, the direct child dependency map, or an array of all unique child dependencies.

- [getRootPath](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L365) - Returns the root execution path.

- [getTopLevelDependencies](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L417) - Returns all top level package dependencies and devDependencies. If `jspmPackages` is
defined only the keys of `jspmPackages` will be resolved.

- [parseChildDependencies](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L442) - Provides a map of all child dependencies defined in `config.js` / `System.packages`.
`System.packages` stores the mapped dependency paths by a `file://` reference, but we actually want the mapped paths
for the package. This function parses `System.packages` converting the entries into the desired format.

- [parseNormalizedPackage](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/src/parser.js#L486) - Attempts to normalize and parse a packageName returning `null` if it is an invalid package
or an object hash
containing the parsed package details. Note: Only works in the Node execution environment.

To install: `npm install typhonjs-config-jspm-parse`

For the latest significant changes please see the [CHANGELOG](https://github.com/typhonjs-node-jspm/typhonjs-config-jspm-parse/blob/master/CHANGELOG.md).

For instance in specifying further user defined mapped paths in additional config loading here is an example
from backbone-parse-es6-todos that maps a source file from a child dependency of `backbone`
(https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/config/config-app-paths.js):
```
var System = System || global.System;

var JSPMParser = JSPMParser || (typeof require !== 'undefined' ? require('typhonjs-config-jspm-parse') : undefined);

var packageResolver = JSPMParser.getPackageResolver(System);
var pathBackboneEvents = packageResolver.getDirectDependency('backbone', 'typhonjs-core-backbone-events');

System.config(
{
   map:
   {
      'mainEventbus': pathBackboneEvents + '/src/mainEventbus.js',
   }
});
```

In the case of running in the browser load `typhonjs-config-jspm-parse` before usage.
```
<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script src="node_modules/typhonjs-config-jspm-parse/src/parser.js"></script>
<script src="config/config-app-paths.js"></script>
<script>System.import('main.js');</script>
```

Please see `package.json` and the `jspm` entries from `backbone-parse-es6-todos`:
https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/package.json

In this case `backbone` is mapped to `github:typhonjs-backbone-parse/backbone-parse-es6@master`

The above code example searches for the mapped package `typhonjs-core-backbone-events` which is mapped
in the `package.json` of `github:typhonjs-backbone-parse/backbone-parse-es6@master`:
https://github.com/typhonjs-backbone-parse/backbone-parse-es6/blob/master/package.json
