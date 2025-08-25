#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

const child = spawn(
    process.execPath,
    ['--no-warnings', path.join(__dirname, 'index.js'), ...args],
    { stdio: 'inherit' }
);

child.on('exit', (code, signal) => {
    if (signal) {
        process.exit(1);
    }
    process.exit(code);
});

child.on('error', (err) => {
    console.error('Failed to run pandoc:', err);
    process.exit(1);
});
