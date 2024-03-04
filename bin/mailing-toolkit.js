#!/usr/bin/env node

'use strict';

process.title = 'mailing-toolkit';

var semver = require('semver');
var version = require('../package.json').engines.node;

// Exit early if the user's node version is too low.
if (!semver.satisfies(process.version, version)) {
    // Strip version range characters leaving the raw semantic version for output
    var rawVersion = version.replace(/[^\d\.]*/, '');
    console.log(
        'Mailing Toolkit requires at least Node v' + rawVersion + '. ' +
        'You have ' + process.version + '.\n');
    process.exit(1);
  }
  
  // Ok, safe to load ES2015.
  require('../lib/run');