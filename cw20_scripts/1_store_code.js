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

    // store cw20_base contract code
    await contract.store_code(`../wasms/cw20_base.wasm`);
}

main();
