#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');

let path = process.cwd() + '/package.json';

console.log('reading', path);

let pkgJSON = readFileSync(path, {
  encoding: 'utf8',
  flag: 'r',
});

let p;
try {
  p = JSON.parse(pkgJSON);
} catch (e) {
  console.error('error parsing package.json', e);
}

// write a file in the build folder that includes the npm version of this application
// this can be read by the api application, and injected into logs in order to tag
// logs with an accurate api + web app verison pair

let writeTarget = process.cwd() + '/build/web-app-version-tag.json';
console.log('writing', writeTarget);

writeFileSync(
  writeTarget,
  JSON.stringify({ name: p.name, version: p.version }),
);
