import fs from 'fs';
import git from 'git-state';
import glob from 'glob';

const prependLicenseInfo = () => {
  const commit = git.commitSync('.');
  const version = process.env.npm_package_version;
  const msg = `
/**
 * @license munimap
 * munimaplib.js
 * 
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * @author: MASARYK UNIVERSITY
 * @homepage: https://maps.muni.cz/munimap
 * @version: ${version}
 * @commit: ${commit}
 */

`;
  const path = glob.sync('./dist/**/munimaplib.js')[0];
  const data = fs.readFileSync(path);
  const fd = fs.openSync(path, 'w+');
  const insert = Buffer.from(msg);
  fs.writeSync(fd, insert, 0, insert.length, 0);
  fs.writeSync(fd, data, 0, data.length, insert.length);
  fs.close(fd, (err) => {
    if (err) {
      throw err;
    }
  });
};

prependLicenseInfo();
