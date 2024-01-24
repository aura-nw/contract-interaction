const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic);

    console.log("user address: ", contract.userAccount.address);

    // store hello_cw721 contract code
    await contract.store_code(`../wasms/hello_cw721.wasm`);

    // instantiate hello_cw721 contract
    let initMsg = {}
    await contract.instantiate(initMsg);
}

main();
