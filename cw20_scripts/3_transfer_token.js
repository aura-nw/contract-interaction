const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1axljfzc0rjge3zq3jgg4ehtq7el2r4zga0z8g7rj4v9kpwsyk9vsauue0v");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // prepare transfer message
    const transferMsg = {
        transfer: {
            recipient: "aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrt",
            amount: "1000000"
        }
    };

    // execute transfer message
    await contract.execute(transferMsg);
}

main();
