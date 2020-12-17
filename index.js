const fs = require('fs');
const express = require('express');
const base64 = require('base-64');
const { spawn, spawnSync } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static('public'));

function judge(usertoken, problemtoken, code){

    let result = {
        'usertoken':usertoken,
        'problemtoken':problemtoken,
        'compileStatus':false,
        'compileLog':'',
        'testCases':[],
        'isCorrect':false
    };

    const pathPrefix = `${usertoken}_${problemtoken}`;

    fs.writeFileSync(pathPrefix+'.cc', code);

    let [compileStatus, compileLog, appOutputPath] = compile(pathPrefix);

    result.compileLog = compileLog.toString();
    result.compileStatus = compileStatus;

    // console.log(result);

    if(compileStatus){

        result.isCorrect = true;

        let numberofInputs = fs.readdirSync(`${problemtoken}/inputs`).length;

        for(let testCaseNumber = 1; testCaseNumber <= numberofInputs; ++testCaseNumber){

            let inputData = fs.readFileSync(`${problemtoken}/inputs/${testCaseNumber}`).toString();
            let outputData = fs.readFileSync(`${problemtoken}/outputs/${testCaseNumber}`).toString();

            let [isCorrectTestCase, stdoutLog, stderrLog] = evaluateTestCase(appOutputPath, inputData, outputData);

            result.testCases.push({
                'testCaseNumber': testCaseNumber,
                'input': inputData,
                'expectedOutput': outputData,
                'isCorrect': isCorrectTestCase,
                'actualOutput': stdoutLog.trim(),
                'errors': stderrLog
            });

            result.isCorrect = result.isCorrect && isCorrectTestCase;
        }
        
        console.log(result);
    }

    return result;
}

function compile(pathPrefix){

    const outputPath = pathPrefix + '.out';

    const compile = spawnSync('g++', ['-std=c++14', '-o', outputPath, pathPrefix + '.cc'], {
        encoding: 'utf-8'
    });

    return [compile.status == 0? true : false, compile.stderr, outputPath];
}

function evaluateTestCase(appPath, inputData, outputData){

    // console.log(appPath);

    const exec_options = {
        encoding: 'utf-8',
        killSignal : "SIGTERM",
        timeout: 1000,
        input: inputData
    };

    let process = spawnSync('./' + appPath, [], exec_options);

    let isCorrect = false;

    if(process.stdout && process.stdout.toString().trim() == outputData.toString().trim())
    isCorrect = true;

    return [isCorrect, process.stdout.toString(), process.stderr.toString()];
}

// let code = 
// `#include<iostream>

// int main(){
//     int a, b, c;
//     std::cin >> a >> b >> c;
//     std::cout << (a + b + c) << std::endl;
//     // std::cout << a << std::endl;
//     return 0;
// }
// `

//judge('a', 'problem1', code);

let PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => res.sendFile);

app.post('/cpp', (req, res)=> {

    let {usertoken, problemtoken, code} = req.body;
    let result = judge(usertoken, problemtoken, base64.decode(code));
    res.send(result);
})

app.listen(PORT, ()=> console.log('Server Started at Port ' + PORT));

