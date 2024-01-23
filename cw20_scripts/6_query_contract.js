const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1w4xrxnslyat73plcehsxuzk68cpqf59ca22jhmze0thzzwy7a49sk7hra8");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // prepare query balance message
    const queryMsg = {
        balance: {
            address: contract.userAccount.address
        }
    };

    // query balance
    const queryResponse = await contract.query(queryMsg);
    console.log("queryResponse: ", queryResponse);
}

main();
