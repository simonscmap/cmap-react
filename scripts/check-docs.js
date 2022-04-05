#!/usr/bin/env node

const { readFileSync } = require('fs');
const { exec } = require('child_process');
const { normalize, dirname } = require('path');

const findChangedFiles = 'git diff --name-only --cached --diff-filter=ACMR';
const findDocFiles = 'find ./src -name "*doc.md"';

const findNearestDoc = (docDirs, changedFile, depthCount) => {
  let dir = dirname(changedFile);
  // base case: reached the project root
  if (dir === '.') {
    // console.log(`reached base case`);
    return null;
  } else {
    let match = docDirs.find((doc) => doc === dir);
    if (match) {
      // console.log(`match ${depthCount} dir(s) up in`, `${dir}/`)
      return match;
    } else {
      // strip last segment of path of changed file and try again
      return findNearestDoc(docDirs, dirname(changedFile), depthCount + 1);
    }
  }
};

const docIsChanged = (doc, changedFiles) => changedFiles.includes(doc);

// main check

const check = (stagedChangedFiles, docFiles) => {
  let docs = docFiles
    .split('\n')
    .filter((filePath) => !!filePath && filePath.length)
    .map(normalize);

  let changedFiles = stagedChangedFiles
    .split('\n')
    .filter((filePath) => !!filePath && filePath.length)
    .map(normalize);

  let changedSrcFiles = changedFiles.filter((f) => !f.includes('.md'));

  // for each changed src file (excluding doc files), check that the nearest
  // doc file in the file tree has also been changed

  let changedWithoutDocumentation = changedSrcFiles.filter((changedSrcFile) => {
    let docDirs = docs.map(dirname);
    let nearestDoc = findNearestDoc(docDirs, changedSrcFile, 0);
    if (nearestDoc) {
      return !docIsChanged(nearestDoc, changedFiles);
    } else {
      // could not find a doc
      return false;
    }
  });

  if (changedWithoutDocumentation.length === 0) {
    console.log('All source changes correspond with changed doc files.');
  } else {
    console.log(
      `The following changes need documentation:`,
      changedWithoutDocumentation,
    );
    process.exit(1);
  }
};

// run it

console.log(`Checking that documentation is up to date...\n`);

// find files that have changed since the last commit
exec(findChangedFiles, (gitErr, gitStdout) => {
  if (gitErr) {
    console.error(`exec error: ${gitErr}`);
    return;
  }

  // instead, find the nearest doc file in the file tree
  // and check to see if it has changed

  // find any docs files (named *-doc.md)
  exec(findDocFiles, (findErr, findStdout) => {
    if (findErr) {
      console.error(`exec error: ${findErr}`);
      return;
    }

    check(gitStdout, findStdout);
  });
});
