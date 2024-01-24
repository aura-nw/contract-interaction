const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 1690);

    console.log("user address: ", contract.userAccount.address);
    console.log("codeId: ", contract.codeId);

    // prepare instantiate message
    const initMsg = {
        name: "CW721 Token on Euphoria",
        symbol: "CTE",
        minter: contract.userAccount.address,
    };

    // instantiate new cw721_base contract
    await contract.instantiate(initMsg);
}

main();
