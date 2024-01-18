const fs = require('fs');
const CHAINS = require('./config/chains');
const Contract = require('./utils/contract')

// load mnemonic from file
const mnemonic = fs.readFileSync(`.secret`).toString().trim();

async function main() {

    let contract = await Contract.init(CHAINS.euphoria, mnemonic);

    console.log("user address: ", contract.userAccount.address);
}

main();
