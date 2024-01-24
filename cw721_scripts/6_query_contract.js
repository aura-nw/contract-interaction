const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1dpetprskh7mkgq9svg04a2vh8043950kwlv2p3zg03mz4yv08nzqjpek7s");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // prepare query balance message
    const queryMsg = {
        owner_of: {
            token_id: "abc1234"
        }
    };

    // query balance
    const queryResponse = await contract.query(queryMsg);
    console.log("queryResponse: ", queryResponse);
}

main();
