#!/usr/bin/env node

const fs = require('fs');
const jq = require('node-jq');

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

// Problem: `include "__";` at the beginning of filters causes errors.  node-jq serializes
//   input objects to JSON and concatenates the filter to it as "<input> | <filter>".  jq
//   allows "include" directives only at the beginning of filters.  This concatenation puts
//   the "include" in the middle of the filter instead.
// Workaround: Remove the "include" directive from the filter.  Read the contents of the "__.jq"
//   module file into a constant, then prepend it to filters.
const filterPreamble = fs.readFileSync('xor.jq', 'utf8');
const jqOptions = {input: 'json'};

// Expected: List of terms that contain both specs in the *SAME* definition.
// Actual: List of terms that contain both specs in *ANY* definition.
// var filter = '.{(.mapping.spec == "' + specFrom + '") && (.mapping.spec == "' + specTo + '")}.term';
var filter =
    'map(.|select(.mapping[].spec|xor(contains(["' +
    specFrom +
    '"]); contains(["' +
    specTo +
    '"])))|{term, mapping: [.mapping[]|select(.spec|(contains(["' +
    specFrom +
    '"]) or contains(["' +
    specTo +
    '"])))]})'; // terms with specFrom value
var mapping = JSON.parse(fs.readFileSync('mapping.json', 'utf8'));

// var filter = 'map(select(.letters | xor(contains(["a"]); contains(["b"]))))';
// var mapping = JSON.parse(fs.readFileSync('data.json', 'utf8'));

jq.run(filterPreamble + filter, mapping, jqOptions).then(console.log);

console.log('Ending ahanca...');
