const { exec } = require('child_process');

const command = 'node index.js test.md -o test.html';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    console.log('Test finished. Check test.html for the output.');
});