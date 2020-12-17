const { spawnSync } = require('child_process');

let output = spawnSync('./a_problem1.out', [], {
    encoding: 'utf-8',
    input: 'string\n'
})

console.log(output.stdout.trim() == "string\n".trim());