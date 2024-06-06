#!/usr/bin/env node

'use strict';

process.title = 'mailing-toolkit';

import semver from 'semver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load the package.json file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
const version = pkg.engines.node;
// Exit early if the user's node version is too low.
if (!semver.satisfies(process.version, version)) {
    // Strip version range characters leaving the raw semantic version for output
    var rawVersion = version.replace(/[^\d\.]*/, '');
    console.log(
        'Mailing Toolkit requires at least Node v' + rawVersion + '. ' +
        'You have ' + process.version + '.\n');
    process.exit(1);
  }
  
  // Ok, safe to load the CLI now.
  import('../lib/run.js');