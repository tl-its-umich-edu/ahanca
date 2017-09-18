#!/usr/bin/env node

const fs = require('fs');

// JSPath syntax is not exactly like XPath.
// See: https://github.com/dfilatov/jspath
const JSPath = require('jspath');

var mapping = JSON.parse(fs.readFileSync('mapping.json', 'utf8'));

const argumentErrorMessage = 'Error: Exactly 2 arguments are required';
const arguments = require('yargs')
    .usage('Usage: $0 [options] <specFrom> <specTo>')
    .command('specFrom', 'Specification version to be converted from (e.g., "caliper-1p0")') // first ARGUMENT
    .command('specTo', 'Specification version to be converted to (e.g., "caliper-1p1")') // second ARGUMENT
    .demandCommand(2, 2, argumentErrorMessage, argumentErrorMessage) // num. of req. ARGUMENTS (NOT commands)
    .argv._;

[specFrom, specTo] = arguments.slice(0, 2);

console.log('Starting ahanca...');
console.log('Converting from: "%s".  Converting to: "%s"', specFrom, specTo);


// Expected: List of terms that contain both specs in the *SAME* definition.
// Actual: List of terms that contain both specs in *ANY* definition.
console.dir(JSPath.apply(
    '.{(.mapping.specification == "' + specFrom + '") && (.mapping.specification == "' + specTo + '")}.term',
    mapping), {'depth': 9999});

console.log('Ending ahanca...');
