/**
 * 000Init -- Bootstraps the testing process. Any previous coverage (./coverage) are deleted.
 *
 * @type {fse|exports|module.exports}
 */

var fs = require('fs-extra');

if (fs.existsSync('./coverage'))
{
   fs.removeSync('./coverage');
}