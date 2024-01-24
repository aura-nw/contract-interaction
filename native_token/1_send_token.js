const CHAINS = require('../config/chains');
const { Contract, ExecuteMsg } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic);

    console.log("user address: ", contract.userAccount.address);

    const RECIPIENT = "aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrt";
    const AMOUNT = 1000000;

    // execute multiple send token
    await contract.send_token(RECIPIENT, AMOUNT);
}

main();
