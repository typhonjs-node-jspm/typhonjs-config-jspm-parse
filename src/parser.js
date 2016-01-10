/**
 * typhonjs-config-jspm-parse -- Provides several utility functions to parse JSPM packages and find normalized paths
 * from `package.json` and `config.js` using an instance of System / SystemJS Loader. This npm module works in the
 * Node execution environment and the browser. The following functions are available:
 *
 * `getPackageJSPMDependencies` - Parses the packageObj / top level package.json for the JSPM entry to index JSPM
 * dependencies. If an existing `jspmPackageMap` object hash exists then only the keys in that hash are resolved against
 * `jspm.dependencies` entry in `package.json`.
 *
 * `getPackageJSPMDevDependencies` - Parses the packageObj / top level package.json for the JSPM entry to index JSPM
 * devDependencies. If an existing `jspmPackageMap` object hash exists then only the keys in that hash are resolved
 * against `jspm.devDependencies` entry in `package.json`.
 *
 * `getPackageResolver` - Returns an instance of PackageResolver which provides all top level (topLevelPackages) and
 * child package (childPackageMap) dependencies. An optional `packageFilter` parameter which is an array of strings will
 * limit the resolver to specifically those top level packages. Additional methods: `getDirectDependency`,
 * `getDirectDependencyMap` & `getUniqueDependencyList` provide functionality to respectively return
 * a specific direct child dependency, the direct child dependency map, or an array of all child dependencies.
 *
 * `getRootPath` - Returns the root execution path.
 *
 * `getTopLevelDependencies` - Returns all top level package dependencies and devDependencies. If `jspmPackages` is
 * defined only the keys of `jspmPackages` will be resolved.
 *
 * `parseChildDependencies` - Provides a map of all child dependencies defined in `config.js` / `System.packages`.
 * `System.packages` stores the mapped dependency paths by a `file://` reference, but we actually want the mapped paths
 * for the package. This function parses `System.packages` converting the entries into the desired format.
 *
 * `parseNormalizedPackage` - Attempts to normalize and parse a packageName returning `null` if it is an invalid package
 * or an object hash
 * containing the parsed package details. Note: Only works in the Node execution environment.
 *
 * For instance in specifying further user defined mapped paths in additional config loading here is an example
 * from backbone-parse-es6-todos that maps a source file from a child dependency of `backbone`
 * (https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/config/config-app-paths.js):
 * ```
 * var System = System || global.System;
 *
 * var JSPMParser = JSPMParser || (typeof require !== 'undefined' ? require('typhonjs-config-jspm-parse') : undefined);
 *
 * var packageResolver = JSPMParser.getPackageResolver(System);
 * var pathBackboneCommon = packageResolver.getDirectDependency('backbone', 'typhonjs-backbone-common');
 *
 * System.config(
 * {
 *    map:
 *    {
 *       'mainEventbus': pathBackboneCommon + '/src/mainEventbus.js',
 *    }
 * });
 * ```
 *
 * In the case of running in the browser load `typhonjs-config-jspm-parse` before usage.
 * ```
 * <script src="jspm_packages/system.js"></script>
 * <script src="config.js"></script>
 * <script src="node_modules/typhonjs-config-jspm-parse/src/parser.js"></script>
 * <script src="config/config-app-paths.js"></script>
 * <script>System.import('main.js');</script>
 * ```
 *
 * Please see `package.json` and the `jspm` entries from backbone-parse-es6-todos:
 * https://github.com/typhonjs-demos/backbone-parse-es6-todos/blob/master/package.json
 *
 * In this case `backbone` is mapped to `github:typhonjs/backbone-parse-es6@master`
 *
 * The above code example searches for the mapped package `typhonjs-backbone-common` which is subsequently mapped
 * in the `package.json` of `github:typhonjs/backbone-parse-es6@master`:
 * https://github.com/typhonjs/backbone-parse-es6/blob/master/package.json
 */

'use strict';

(function()
{
   var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
   var isWindows = typeof process !== 'undefined' && !!process.platform.match(/^win/);

   /**
    * Parses the packageObj / top level package.json for the JSPM entry to index JSPM dependencies. If an existing
    * `jspmPackageMap` object hash exists then only the keys in that hash are resolved against `jspm.dependencies` entry
    * in `package.json`.
    *
    * @param {object}   packageObj     - package.json object
    * @param {object}   jspmPackageMap - An optional predefined jspmPackageMap to limit dependency resolution.
    * @param {boolean}  silent         - An optional boolean to suppress log output.
    * @param {string}   logTitle       - An optional string to title log output.
    * @returns {*}
    */
   function getPackageJSPMDependencies(packageObj, jspmPackageMap, silent, logTitle)
   {
      silent = silent || false;
      logTitle = logTitle || 'typhonjs-config-jspm-parse';

      // Return early if there is no `jspm` entry in `package.json`.
      if (typeof packageObj.jspm !== 'object')
      {
         if (!silent)
         {
            console.log(logTitle + ' - Warning: could not locate `jspm` entry in `package.json`.');
         }
         return jspmPackageMap || {};
      }

      // Return early if there is no `jspm.dependencies` entry in `package.json`.
      if (typeof packageObj.jspm.dependencies !== 'object')
      {
         if (!silent)
         {
            console.log(logTitle + ' - Warning: could not locate `jspm.dependencies` entry in `package.json`.');
         }
         return jspmPackageMap || {};
      }

      // If an existing jspmPackageMap hash is passed in then only resolve dependencies entries in the hash.
      if (typeof jspmPackageMap === 'object')
      {
         for (var key in jspmPackageMap)
         {
            if (typeof packageObj.jspm.dependencies[key] !== 'undefined')
            {
               jspmPackageMap[key] = packageObj.jspm.dependencies[key];
            }
            else if (!silent)
            {
               console.log(logTitle + " - Warning: could not locate package '" + key
                + "' in `jspm.dependencies` entry in `package.json`.");
            }
         }
         return jspmPackageMap;
      }
      else
      {
         return packageObj.jspm.dependencies;
      }
   }

   /**
    * Parses the packageObj / top level package.json for the JSPM entry to index JSPM devDependencies. If an existing
    * `jspmPackageMap` object hash exists then only the keys in that hash are resolved against `jspm.devDependencies`
    * entry in `package.json`.
    *
    * @param {object}   packageObj     - package.json object
    * @param {object}   jspmPackageMap - An optional predefined jspmPackageMap to limit dependency resolution.
    * @param {boolean}  silent         - An optional boolean to suppress log output.
    * @param {string}   logTitle       - An optional string to title log output.
    * @returns {*}
    */
   function getPackageJSPMDevDependencies(packageObj, jspmPackageMap, silent, logTitle)
   {
      silent = silent || false;
      logTitle = logTitle || 'typhonjs-config-jspm-parse';

      // Return early if there is no `jspm` entry in `package.json`.
      if (typeof packageObj.jspm !== 'object')
      {
         if (!silent)
         {
            console.log(logTitle + ' - Warning: could not locate `jspm` entry in `package.json`.');
         }
         return jspmPackageMap || {};
      }

      // Return early if there is no `jspm.dependencies` entry in `package.json`.
      if (typeof packageObj.jspm.devDependencies !== 'object')
      {
         if (!silent)
         {
            console.log(logTitle + ' - Warning: could not locate `jspm.devDependencies` entry in `package.json`.');
         }
         return jspmPackageMap || {};
      }

      // If an existing jspmPackageMap hash is passed in then only resolve devDependencies entries in the hash.
      if (typeof jspmPackageMap === 'object')
      {
         for (var key in jspmPackageMap)
         {
            if (typeof packageObj.jspm.devDependencies[key] !== 'undefined')
            {
               jspmPackageMap[key] = packageObj.jspm.devDependencies[key];
            }
            else if (!silent)
            {
               console.log(logTitle + " - Warning: could not locate package '" + key
                + "' in `jspm.devDependencies` entry in `package.json`.");
            }
         }
         return jspmPackageMap;
      }
      else
      {
         return packageObj.jspm.devDependencies;
      }
   }

   /**
    * Returns an instance of PackageResolver which provides all top level (topLevelPackages) and child
    * package (childPackageMap) dependencies. An optional `packageFilter` parameter which is an array of strings will
    * limit the resolver to specifically those top level packages. Additional methods: `getDirectDependency`,
    * `getDirectDependencyMap` & `getAllUniqueDependencyList` provide functionality to respectively return
    * a specific direct child dependency, the direct child dependency map, or an array of all child dependencies.
    *
    * @param {object}         System - An instance of System or SystemJS Loader.
    * @param {Array<string>}  packageFilter - packageFilter - An optional array to limit top level package parsing.
    * @return {{}}
    */
   function getPackageResolver(System, packageFilter)
   {
      var packageResolver = {};

      /**
       * Provides a map of top level mapped packages to their package dependency.
       * @type {{}}
       */
      packageResolver.topLevelPackages = getTopLevelDependencies(System, packageFilter);

      /**
       * Provides a map of all child dependencies defined in `config.js` / `System.packages`.
       * @type {{}}
       */
      packageResolver.childPackageMap = parseChildDependencies(System);

      /**
       * Returns the package dependency path for the given mapped top level package name and one or more potential child
       * package names.
       *
       * @param {string}                  topLevelPackageName - A top level mapped package name.
       * @param {string | Array<string>}  childPackageNames - An optional string or array of strings of child mapped
       *                                                      package name(s).
       * @returns {string|undefined}
       */
      packageResolver.getDirectDependency = function(topLevelPackageName, childPackageNames)
      {
         var topLevelKey = packageResolver.topLevelPackages[topLevelPackageName];

         if (typeof packageResolver.childPackageMap[topLevelKey] !== 'object') { return undefined; }

         if (typeof childPackageNames === 'string') { childPackageNames = [childPackageNames]; }

         if (!Array.isArray(childPackageNames)) { throw new TypeError('childPackageNames is not an array.'); }

         var nextChildKey = topLevelKey;

         for (var cntr = 0; cntr < childPackageNames.length; cntr++)
         {
            nextChildKey = typeof packageResolver.childPackageMap[nextChildKey] === 'object' ?
             packageResolver.childPackageMap[nextChildKey][childPackageNames[cntr]] : undefined;

            if (nextChildKey === undefined) { break; }
         }

         return nextChildKey;
      };

      /**
       * Returns the package dependency map for the given mapped top level package name and any child package names.
       *
       * @param {string}   topLevelPackageName - A top level mapped package name.
       * @param {string | Array<string>}  childPackageNames - An optional string or array of strings of child mapped
       *                                                      package name(s).
       * @returns {{}|undefined}
       */
      packageResolver.getDirectDependencyMap = function(topLevelPackageName, childPackageNames)
      {
         var topLevelKey = packageResolver.topLevelPackages[topLevelPackageName];

         if (typeof packageResolver.childPackageMap[topLevelKey] !== 'object') { return undefined; }

         if (typeof childPackageNames === 'undefined') { return packageResolver.childPackageMap[topLevelKey]; }

         if (typeof childPackageNames === 'string') { childPackageNames = [childPackageNames]; }

         if (!Array.isArray(childPackageNames)) { throw new TypeError('childPackageNames is not an array.'); }

         var nextChildKey = topLevelKey;

         for (var cntr = 0; cntr < childPackageNames.length; cntr++)
         {
            nextChildKey = typeof packageResolver.childPackageMap[nextChildKey] === 'object' ?
             packageResolver.childPackageMap[nextChildKey][childPackageNames[cntr]] : undefined;

            if (nextChildKey === undefined) { break; }
         }

         return packageResolver.childPackageMap[nextChildKey];
      };

      /**
       * Returns all unique dependency paths for a given array of top level packages. If `topLevelPackageFilter` is
       * not defined the keys of `packageResolver.topLevelPackages` are used.
       *
       * @param {string|Array<string>}  topLevelPackageFilter - An optional parameter to limit top level packages
       *                                                        searched.
       * @returns {Array<string>}
       */
      packageResolver.getUniqueDependencyList = function(topLevelPackageFilter)
      {
         topLevelPackageFilter = topLevelPackageFilter || Object.keys(packageResolver.topLevelPackages);

         if (typeof topLevelPackageFilter === 'string') { topLevelPackageFilter = [topLevelPackageFilter]; }

         if (!Array.isArray(topLevelPackageFilter)) { throw new TypeError('topLevelPackageFilter is not an array.'); }

         // Stores seen packages to eliminate duplicates.
         var seenPackages = {};

         // Child dependency package names.
         var childPackages = [];

         // Process top level packages.
         for (var cntr = 0; cntr < topLevelPackageFilter.length; cntr++)
         {
            var topLevelPackage = packageResolver.topLevelPackages[topLevelPackageFilter[cntr]];

            // Object hash of top level dependency.
            var packageDependency = packageResolver.childPackageMap[topLevelPackage];

            // For each child dependency add the package name to `childPackages` if it has not been seen yet.
            for (var packageName in packageDependency)
            {
               if (typeof seenPackages[packageDependency[packageName]] === 'undefined')
               {
                  childPackages.push(packageDependency[packageName]);
               }

               seenPackages[packageDependency[packageName]] = 1;
            }
         }

         // Traverse `childPackages` adding additional children dependencies if they have not been seen yet.
         for (cntr = 0; cntr < childPackages.length; cntr++)
         {
            packageDependency = packageResolver.childPackageMap[childPackages[cntr]];

            for (packageName in packageDependency)
            {
               if (typeof seenPackages[packageDependency[packageName]] === 'undefined')
               {
                  childPackages.push(packageDependency[packageName]);
               }

               seenPackages[packageDependency[packageName]] = 1;
            }
         }

         return childPackages;
      };

      return packageResolver;
   }

   /**
    * Returns the root execution path.
    *
    * @returns {*}
    */
   function getRootPath()
   {
      var baseURI;

      /* eslint-disable no-undef */

      // environent baseURI detection
      if (typeof document !== 'undefined' && document.getElementsByTagName)
      {
         baseURI = document.baseURI;

         if (!baseURI)
         {
            var bases = document.getElementsByTagName('base');
            baseURI = bases[0] && bases[0].href || window.location.href;
         }

         // sanitize out the hash and querystring
         baseURI = baseURI.split('#')[0].split('?')[0];
         baseURI = baseURI.substr(0, baseURI.lastIndexOf('/') + 1);
      }
      else if (typeof process !== 'undefined' && process.cwd)
      {
         baseURI = process.cwd() + '/';
         if (isWindows)
         {
            baseURI = baseURI.replace(/\\/g, '/');
         }
      }
      else if (typeof location !== 'undefined')
      {
         baseURI = __global.location.href;
      }
      else
      {
         throw new TypeError('No environment baseURI');
      }

      /* eslint-enable no-undef */

      return baseURI;
   }

   /**
    * Returns all top level package dependencies and devDependencies. If `packageFilter` is defined only the keys of
    * `packageFilter` will be resolved.
    *
    * @param {object}         System - An instance of System or SystemJS Loader.
    * @param {Array<string>}  packageFilter - An optional array to limit top level package parsing.
    * @return {{}}
    */
   function getTopLevelDependencies(System, packageFilter)
   {
      var topLevelPackages = {};

      if (!Array.isArray(packageFilter))
      {
         var keys = Object.keys(System.map);
         keys.forEach(function(key) { topLevelPackages[key] = System.map[key]; });
      }
      else
      {
         packageFilter.forEach(function(key) { topLevelPackages[key] = System.map[key]; });
      }

      return topLevelPackages;
   }

   /**
    * Provides a map of all child dependencies defined in `config.js` / `System.packages`. `System.packages` stores
    * the mapped dependency paths by a `file://` reference, but we actually want the mapped paths for the package. This
    * function parses `System.packages` converting the entries into the desired format.
    *
    * @param {object}   System - An instance of System or SystemJS Loader.
    * @returns {{}}
    */
   function parseChildDependencies(System)
   {
      var childPackageMap = {};

      var keys = Object.keys(System.packages);
      keys.forEach(function(key)
      {
         var parsedKey = key.split('jspm_packages/');

         if (parsedKey && parsedKey.length >= 2)
         {
            // Replace the first slash with ":" which conforms to the mapped path.
            var actualKey = parsedKey[1].replace('/', ':');

            var mapCopy = {};

            // Make a copy of System.packages[key].map
            if (typeof System.packages[key].map === 'object')
            {
               var mapKeys = Object.keys(System.packages[key].map);
               mapKeys.forEach(function(mapKey) { mapCopy[mapKey] = System.packages[key].map[mapKey]; });
            }

            childPackageMap[actualKey] = mapCopy;
         }
      });

      return childPackageMap;
   }

   /**
    * Attempts to normalize and parse a packageName returning `null` if it is an invalid package or an object hash
    * containing the parsed package details.
    *
    * Note: Only works in the Node execution environment.
    *
    * @param {object}   System      - SystemJS Loader instance
    * @param {string}   packageName - Package name to normalize & parse.
    * @param {string}   rootPath    - Path to root of project.
    * @param {boolean}  silent      - An optional boolean to suppress log output.
    * @param {string}   logTitle    - An optional string to title log output.
    * @param {function} extraParser - An optional function to provide extra parsing to initial result generated.
    * @returns {*}
    */
   function parseNormalizedPackage(System, packageName, rootPath, silent, logTitle, extraParser)
   {
      var result = null;

      if (isBrowser)
      {
         console.warn('parseNormalizedPackage is not available in the browser environment.');
         return result;
      }

      rootPath = rootPath || getRootPath();

      var fs =    require('fs');
      var path =  require('path');
      var url =   require('url');

      silent = silent || false;
      logTitle = logTitle || 'typhonjs-config-jspm-parse';

      // The normalized file URL from SystemJS Loader.
      var normalized = System.normalizeSync(packageName);

      // Any package name with an @ in the name is a dependent package like 'github:typhonjs/backbone-es6@master'.
      var isDependency = packageName.indexOf('@') >= 0;

      // Only process valid JSPM packages
      if (normalized.indexOf('jspm_packages') >= 0)
      {
         // Parse the file URL.
         var parsedPath = path.parse(url.parse(normalized).pathname);

         // Full path to the JSPM package
         var fullPath = parsedPath.dir + path.sep + parsedPath.name;

         // Relative path from the rootPath to the JSPM package.
         var relativePath = path.relative(rootPath, parsedPath.dir) + path.sep + parsedPath.name;

         try
         {
            var actualPackageName = parsedPath.name.split('@').shift();

            // Verify that the full path to the JSPM package source exists.
            if (!fs.existsSync(fullPath)) { throw new Error("full path generated '" + fullPath + "' does not exist"); }

            result =
            {
               packageName: isDependency ? actualPackageName : packageName,
               actualPackageName: actualPackageName,
               isDependency: isDependency,
               fullPath: fullPath,
               relativePath: relativePath
            };

            result.isAlias = result.packageName !== actualPackageName;

            // If an extra parser function is supplied then allow it to filter / extend result.
            if (typeof extraParser === 'function') { result = extraParser(result, silent, logTitle); }
         }
         catch(err)
         {
            if (!silent)
            {
               console.log("JSPMParser - " + logTitle + " - " + err + " for JSPM package '" + packageName + "'");
            }

            result = null;
         }
      }
      else
      {
         if (!silent)
         {
            console.log("JSPMParser - " + logTitle + " - Warning: skipping '" + packageName
             + "' as it does not appear to be a JSPM package.");
         }
      }

      return result;
   }

   var root = this;

   /**
    * If the environment is Node / CJS then export the functions otherwise if running in the browser create a global
    * reference at `JSPMParser`.
    */
   if (typeof exports !== 'undefined')
   {
      exports.getPackageJSPMDependencies = getPackageJSPMDependencies;
      exports.getPackageJSPMDevDependencies = getPackageJSPMDevDependencies;
      exports.getPackageResolver = getPackageResolver;
      exports.getRootPath = getRootPath;
      exports.getTopLevelDependencies = getTopLevelDependencies;
      exports.parseChildDependencies = parseChildDependencies;
      exports.parseNormalizedPackage = parseNormalizedPackage;
   }
   else if (isBrowser)
   {
      root.JSPMParser =
      {
         getPackageJSPMDependencies: getPackageJSPMDependencies,
         getPackageJSPMDevDependencies: getPackageJSPMDevDependencies,
         getRootPath: getRootPath,
         getTopLevelDependencies: getTopLevelDependencies,
         parseChildDependencies: parseChildDependencies,
         parseNormalizedPackage: parseNormalizedPackage
      };
   }
}).call(this);