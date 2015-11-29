var assert     = require('power-assert');
var jspm       = require('jspm');

var JSPMParser = require('../../src/parser.js');

jspm.setPackagePath(JSPMParser.getRootPath());

// Create SystemJS Loader
var System = new jspm.Loader();

/**
 * These tests confirm that JSPMParser is behaving as expected.
 *
 * @test {onHandleCode}
 */
describe('JSPMParser Tests', function()
{
   it('getPackageResolver', function()
   {
      var packageResolver = JSPMParser.getPackageResolver(System);

      assert(typeof packageResolver === 'object');
      assert(typeof packageResolver.topLevelPackages === 'object');
      assert(typeof packageResolver.childPackageMap === 'object');
      assert(typeof packageResolver.getDirectDependency === 'function');
      assert(typeof packageResolver.getDirectDependencyMap  === 'function');
      assert(typeof packageResolver.getUniqueDependencyList  === 'function');

      assert(JSON.stringify(Object.keys(packageResolver.topLevelPackages))
       === '["babel","babel-runtime","backbone","core-js"]');

      assert(packageResolver.getDirectDependency('backbone', 'typhonjs-backbone-common')
       === 'github:typhonjs/typhonjs-core-backbone-common@master');

      assert(JSON.stringify(Object.keys(packageResolver.getDirectDependencyMap('backbone')))
       === '["backbone-es6","backbone-query","parse","typhonjs-backbone-common","underscore"]');

      var allBackboneDependencies = packageResolver.getUniqueDependencyList('backbone');

      assert(Array.isArray(allBackboneDependencies));

      /**
       * Should have a length of 13 and be a variation of: ["github:typhonjs/backbone-es6@master","github:typhonjs/typhonjs-core-backbone-query@master","npm:parse@1.6.9","github:typhonjs/typhonjs-core-backbone-common@master","npm:underscore@1.8.3","npm:babel-runtime@5.8.34","github:jspm/nodelibs-process@0.1.2","npm:process@0.11.2","github:jspm/nodelibs-assert@0.1.0","npm:assert@1.3.0","npm:util@0.10.3","npm:inherits@2.0.1","github:jspm/nodelibs-util@0.1.0"]
       */
      assert(allBackboneDependencies.length === 13);
   });

   it('getRootPath', function()
   {
      var rootPath = JSPMParser.getRootPath();
      assert((/typhonjs-config-jspm-parse\/$/).exec(rootPath));
   });

   it('getTopLevelDependencies', function()
   {
      var topLevelDependencies = JSPMParser.getTopLevelDependencies(System);
      assert(typeof topLevelDependencies === 'object');

      assert(JSON.stringify(Object.keys(topLevelDependencies)) === '["babel","babel-runtime","backbone","core-js"]');
   });

   it('parseChildDependencies', function()
   {
      var childDependencies = JSPMParser.parseChildDependencies(System);

      assert(typeof childDependencies === 'object');

      /**
       * Should have a length of 16
       */
      assert(Object.keys(childDependencies).length === 16);
   });

   it('parseNormalizedPackage', function()
   {
      var backboneMappedPath = JSPMParser.parseNormalizedPackage(System, 'backbone');

      assert(typeof backboneMappedPath === 'object');

      assert(JSON.stringify(backboneMappedPath) === '{"packageName":"backbone","actualPackageName":"backbone-parse-es6","isDependency":false,"fullPath":"/Volumes/Data/program/web/projects/TyphonJS/repos/typhonjs-config-jspm-parse/jspm_packages/github/typhonjs/backbone-parse-es6@master","relativePath":"jspm_packages/github/typhonjs/backbone-parse-es6@master","isAlias":true}');
   });
});