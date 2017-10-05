#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');
const jq = require('node-jq');

const argumentsRequired = {
    specFrom: 'Specification version to be converted from (e.g., "caliper-1p0")',
    specTo: 'Specification version to be converted to (e.g., "caliper-1p1")',
    inputFilename: 'Name of the input file',
};
const argumentsRequiredNum = Object.keys(argumentsRequired).length;
const argumentsRequiredError = 'Error: Exactly ' + argumentsRequiredNum + ' arguments are required';

const argumentParser = require('yargs')
    .usage('Usage: $0 [options] ' + '<' + Object.keys(argumentsRequired).join('> <') + '>');

for (var argument in argumentsRequired) {
    if (argumentsRequired.hasOwnProperty(argument)) {
        console.log(argument + " -> " + argumentsRequired[argument]);
        argumentParser.command(argument, argumentsRequired[argument]);
    }
}

var arguments = argumentParser
    .demandCommand(argumentsRequiredNum, argumentsRequiredNum,
        argumentsRequiredError, argumentsRequiredError)
    .argv._;

var specFrom, specTo, inputFilename;
[specFrom, specTo, inputFilename] = arguments.slice(0, argumentsRequiredNum);

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

var filter =
    '"' + specFrom + '" as $specFrom | ' +
    '"' + specTo + '" as $specTo | ' +
    'map(. | select(.mapping[].spec | xor(contains([$specFrom]); contains([$specTo]))) | ' +
    '{term, mapping: [.mapping[] | select(.spec | (contains([$specFrom]) or contains([$specTo])))]})';
var mapping = JSON.parse(fs.readFileSync('mapping.json', 'utf8'));

// var terms = _(mapping).map(function (termMap) {
//     return termMap.term
// }).value()

var terms = _(mapping)
    .filter(function (t) {
        return t.domain.includes('ahanca:root');
    })
    .map(function (termMap) {
        return termMap.term
    })
    .value();

console.dir(terms, {'depth': 9999});

var specs = _(mapping)
    .filter(function (t) {
        return t.domain.includes('ahanca:root');
    })
    .map(function (termMap) {
        return _.map(termMap, 'spec');
    })
    .value();

console.dir(specs, {'depth': 9999});

process.exit(999);

jq.run(filterPreamble + filter, mapping, jqOptions).then(console.log);

console.log('Ending ahanca...');
