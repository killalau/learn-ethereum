const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const sourceCode = fs.readFileSync('greetings.sol').toString();
const compiledCode = solc.compile(sourceCode);

const contractABI = JSON.parse(compiledCode.contracts[':Greetings'].interface);

const greetingsContract = web3.eth.contract(contractABI);
const bytecode = compiledCode.contracts[':Greetings'].bytecode;

const greetingsDeployed = greetingsContract.new({ data: bytecode, from: web3.eth.accounts[0], gas: 4700000 });
const greetingsInstance = greetingsContract.at(greetingsDeployed.address);

let msg;
msg = greetingsInstance.getGreetings();
console.log(msg);

greetingsInstance.setGreetings('Hello', { from: web3.eth.accounts[0] });
msg = greetingsInstance.getGreetings();
console.log(msg);
