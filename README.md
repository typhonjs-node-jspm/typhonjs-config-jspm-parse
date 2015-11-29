# typhonjs-config-jspm-parse
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

For instance in specifying further user defined mapped paths in additional config loading here is an example
from backbone-parse-es6-todos
(https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/config/config-app-paths.js):
```
var System = System || global.System;

var JSPMParser = JSPMParser || (typeof require !== 'undefined' ? require('typhonjs-config-jspm-parse') : undefined);

var pathBackboneCommon = packageResolver.getDirectDependency('backbone', 'typhonjs-backbone-common');

System.config(
{
   map:
   {
      'mainEventbus': pathBackboneCommon + '/src/mainEventbus.js',
   }
});
```
