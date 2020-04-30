var account
var contractAddress = '0xa4cedb7277baec50e0445d65bd84869e666fbb18';
var abi = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]');

if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    window.ethereum.enable()
}
else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
}
else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
}

getAccounts = async () => {
    await web3.eth.getAccounts(function (err, accounts) {
        if (err != null) {
            alert("Ocorreu um erro ao buscar suas contas.");
            return;
        }

        if (accounts.length == 0) {
            alert("Nenhuma conta encontrada! Verifique se o Ethereum client está configurado corretamente.");
            return;
        }

        account = accounts[0];
        web3.eth.defaultAccount = account;
        console.log('account', account)
    });
    return account
}

var contract = new web3.eth.Contract(abi, contractAddress);
console.log('Contract: ' + contract.options.address);

var inputsArray = contract.options.jsonInterface.filter(item => item.stateMutability === 'view')
var outputsArray = contract.options.jsonInterface.filter(item => item.stateMutability === 'nonpayable' && item.type === 'function')

function mountMethods(abi, methodName, renderElement) {

    var inputHtml = ""
    for (item of abi) {

        var inputsText = ""
        for (input of item.inputs) {
            if (inputsText === "") inputsText = `<div class=form-group id="${item.name}-inputs">`
            inputsText += `<label>${input.name}</label>
                <input type="text" class="form-control" id="${item.name}-${input.name}-value" placeholder="${input.type}">`
        }
        if (inputsText !== "") inputsText += " </div>"

        inputHtml += `<div class="col-sm-4">
        <div class="card" style="width: 18rem;">
          <div class="card-header" data-toggle="collapse" data-target="#${item.name}-colapse" 
          role="button" aria-expanded="false" aria-controls="${item.name}">${item.name}</div>
          <div class="collapse" id="${item.name}-colapse">
            <div class="card-body">
                ${inputsText}
                <button type="submit" id="execute" class="btn btn-danger" onclick=${methodName}('${JSON.stringify(item)}')>Submit</button>          
            </div>
            <div class="card-footer">
                <div class="row">
                    <div class="col">
                        <p id="${item.name}-value"></p>                    
                    </div>                    
                </div>
            </div>            
          </div>          
        </div>
      </div>`
    }

    document.getElementById(`${renderElement}`).innerHTML = inputHtml
}

function callMethod(abi) {
    const method = prepareMethods(abi)
    if (this.hasInputValuesNotFilled(abi)) {
        document.getElementById(`${method.methodName}-value`).innerHTML = "fill in the fields"
    }

    document.getElementById(`${method.methodName}-value`).innerHTML = 'Wait the transaction fineshed.'
    try {
        contract['methods'][`${method.methodName}`](...method.inputValues).call()
            .then(result => { document.getElementById(`${method.methodName}-value`).innerHTML = result })
            .catch(error => { document.getElementById(`${method.methodName}-value`).innerHTML = error.message })
    } catch (error) {
        document.getElementById(`${methodName}-value`).innerHTML = error.message
    }

}

function sendMethod(abi) {
    const method = prepareMethods(abi)
    if (this.hasInputValuesNotFilled(abi)) {
        document.getElementById(`${method.methodName}-value`).innerHTML = "fill in the fields"
    }

    document.getElementById(`${method.methodName}-value`).innerHTML = 'Wait the transaction fineshed.'
    try {
        contract['methods'][`${method.methodName}`](...method.inputValues).send({ from: account })
            .then(result => { document.getElementById(`${method.methodName}-value`).innerHTML = `TranscationHash: ${result.transactionHash}` })
            .catch(error => { document.getElementById(`${method.methodName}-value`).innerHTML = error.message })
    } catch (error) {
        document.getElementById(`${method.methodName}-value`).innerHTML = error.message
    }
}

function prepareMethods(abi) {
    const abiObject = JSON.parse(abi)
    const methodName = abiObject.name

    let inputValues = []
    const elements = document.getElementById(`${methodName}-inputs`)

    if (elements) {
        const inputs = document.getElementById(`${methodName}-inputs`).querySelectorAll('input')
        inputs.forEach(x => inputValues.push(x.value))
    }
    return { methodName, inputValues }
}

function hasInputValuesNotFilled(abi) {
    const abiObject = JSON.parse(abi)
    const methodName = abiObject.name
    let hasNullValues = false

    const elements = document.getElementById(`${methodName}-inputs`)
    if (elements) {
        const inputs = document.getElementById(`${methodName}-inputs`).querySelectorAll('input')
        inputs.forEach(x => {
            if (x.value === "" || x.value === null || x.value === undefined) {
                hasNullValues = true
            }
        })
    }
    return hasNullValues
}

window.onload = async () => {
    const result = await this.getAccounts()
    if (!result) {
        document.getElementById("main").innerHTML = ""
        document.getElementById("message").innerHTML = "<h2>reload the page when the contract is loaded</h2>"
    } else {
        this.mountMethods(this.outputsArray, 'sendMethod', 'write')
        this.mountMethods(this.inputsArray, 'callMethod', 'read')
    }
};
