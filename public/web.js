document.querySelector('#submitButton').addEventListener('click', ()=>{

    let encodedStr = window.btoa(document.querySelector('#code').value);

    console.log(encodedStr);

    axios.post('/cpp',
        {
            "usertoken": "custardpehelwaan",
            "problemtoken": "problem1",
            "code": encodedStr
    }).then( (response) => {
        console.log(response);
        let displayString = 'Compile Status: '

        if(response.data.compileStatus){
        
        displayString += '<span style="color:green">Success</span><br>'

        if(response.data.compileLog.length)
        displayString += response.data.compileLog + '<br>';
        
        displayString += 'Verdict: ';
        displayString += response.data.isCorrect ? '<span style="color:green">Passed</span>' : '<span style="color:red">Failed</span>';
        displayString += '</br>';


        }
        
        else{
        displayString += '<span style="color:red">Failed</span><br>';
        displayString += response.data.compileLog + '<br>';
        }
        
        document.querySelector('#result').innerHTML = displayString;
    });
})