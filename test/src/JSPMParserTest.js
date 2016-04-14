var assert     = require('chai').assert;
var fs         = require('fs-extra');
var jspm       = require('jspm');
var path       = require('path');

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
   it('getPackageJSPMDependencies', function()
   {
      var packageJSON = fs.readFileSync(JSPMParser.getRootPath() + path.sep + 'package.json').toString();
      var packageObj = JSON.parse(packageJSON);

      var packageMap = JSPMParser.getPackageJSPMDependencies(packageObj);
      assert(JSON.stringify(packageMap) === '{"backbone":"github:typhonjs-backbone-parse/backbone-parse-es6@master"}');

      packageMap = JSPMParser.getPackageJSPMDependencies(packageObj, { backbone: null });
      assert(JSON.stringify(packageMap) === '{"backbone":"github:typhonjs-backbone-parse/backbone-parse-es6@master"}');
   });

   it('getPackageJSPMDevDependencies', function()
   {
      var packageJSON = fs.readFileSync(JSPMParser.getRootPath() + path.sep + 'package.json').toString();
      var packageObj = JSON.parse(packageJSON);

      var packageMap = JSPMParser.getPackageJSPMDevDependencies(packageObj);
      assert(JSON.stringify(packageMap) ===
       '{"babel":"npm:babel-core@5.8.35","babel-runtime":"npm:babel-runtime@5.8.35","core-js":"npm:core-js@1.2.6"}');

      packageMap = JSPMParser.getPackageJSPMDevDependencies(packageObj, { babel: null });
      assert(JSON.stringify(packageMap) === '{"babel":"npm:babel-core@5.8.35"}');
   });

   it('getPackageResolver', function()
   {
      var packageResolver = JSPMParser.getPackageResolver(System);

      assert(typeof packageResolver === 'object');
      assert(typeof packageResolver.topLevelPackages === 'object');
      assert(typeof packageResolver.childPackageMap === 'object');
      assert(typeof packageResolver.getDirectDependency === 'function');
      assert(typeof packageResolver.getDirectDependencyMap  === 'function');
      assert(typeof packageResolver.getUniqueDependencyList  === 'function');

      assert(JSON.stringify(Object.keys(packageResolver.topLevelPackages)) ===
       '["babel","babel-runtime","backbone","core-js"]');

      assert(packageResolver.getDirectDependency('backbone', 'typhonjs-core-backbone-common') ===
       'github:typhonjs-backbone/typhonjs-core-backbone-common@master');

      assert(packageResolver.getDirectDependency('backbone',
       ['typhonjs-core-backbone-common', 'typhonjs-core-utils']) ===
        'github:typhonjs-common/typhonjs-core-utils@master');

      assert(JSON.stringify(Object.keys(packageResolver.getDirectDependencyMap('backbone'))) ===
       '["backbone-es6","parse","typhonjs-core-backbone-common","typhonjs-core-backbone-events","typhonjs-core-backbone-query","typhonjs-core-utils","underscore"]');

      assert(JSON.stringify(Object.keys(packageResolver.getDirectDependencyMap('backbone',
       'typhonjs-core-backbone-common'))) ===
        '["typhonjs-core-utils","underscore"]');

      assert(JSON.stringify(Object.keys(packageResolver.getDirectDependencyMap('backbone',
       ['typhonjs-core-backbone-common']))) ===
        '["typhonjs-core-utils","underscore"]');

      var allBackboneDependencies = packageResolver.getUniqueDependencyList('backbone');

      assert(Array.isArray(allBackboneDependencies));

      /**
       * Should have a length of 17 and be a variation of: ["github:typhonjs/backbone-es6@master","npm:parse@1.6.14","github:typhonjs/typhonjs-core-backbone-common@master","github:typhonjs/typhonjs-core-backbone-events@master","github:typhonjs/typhonjs-core-backbone-query@master","github:typhonjs/typhonjs-core-utils@master","npm:underscore@1.8.3","npm:babel-runtime@5.8.34","github:jspm/nodelibs-process@0.1.2","npm:process@0.11.2","github:jspm/nodelibs-assert@0.1.0","npm:assert@1.3.0","npm:util@0.10.3","npm:inherits@2.0.1","github:jspm/nodelibs-util@0.1.0"]
       */
      assert(allBackboneDependencies.length === 17);
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
       * Should have a length of 18
       */
      assert(Object.keys(childDependencies).length === 18);
   });

   it('parseNormalizedPackage', function()
   {
      var backboneNormalized = JSPMParser.parseNormalizedPackage(System, 'backbone');

      assert(typeof backboneNormalized === 'object');

      assert(backboneNormalized.packageName === 'backbone');
      assert(backboneNormalized.actualPackageName === 'backbone-parse-es6');
      assert(backboneNormalized.isDependency === false);
      assert(backboneNormalized.relativePath === 'jspm_packages/github/typhonjs-backbone-parse/backbone-parse-es6@master');
      assert(backboneNormalized.isAlias === true);
   });
});