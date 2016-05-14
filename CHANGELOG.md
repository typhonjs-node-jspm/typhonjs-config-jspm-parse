## 0.6.1 (2016-05-13)
- Added SCM link creation for NPM modules that format repository URLs as `git://github.com/ instead of `https://github.com/`

## 0.6.0 (2016-05-02)
- Added additional data to normalized package parsing including links to public Github / NPM modules in addition to main entry points.

## 0.5.0 (2016-03-13)
- No new features. Finished integrating `typhonjs-npm-build-test`.

## 0.4.1 (2016-03-07)
- No new features. Removed dependence on `jspm`. Integrated `typhonjs-npm-build-test`.

## 0.4.0 (2016-01-27)
- No new features. Removed dependence on `typhonjs-core-gulptasks`. Updated JSPM version to `0.16.25`.

## 0.3.0 (2016-01-11)
- No new features. Stable version release coordinated with `typhonjs-core-gulptasks@0.4.0`

## 0.2.1 (2016-01-11)
- Minor README.md change
- Fixed lack of export for `getPackageResolver` for browser access.
 
## 0.2.0 (2016-01-10)
- Added getPackageJSPMDependencies
- Added getPackageJSPMDevDependencies
- getPackageResolver -> getDirectDependency & getDirectDependencyMap can now also take an array of `childPackageNames` to retrieve package dependencies for any depth. 

## 0.1.0 (2015-11-28)
- Initial release
