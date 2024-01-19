const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 1681);

    console.log("user address: ", contract.userAccount.address);
    console.log("codeId: ", contract.codeId);

    // prepare instantiate message
    const initMsg = {
        name: "Euphoria Token",
        symbol: "EUPH",
        decimals: 6,
        initial_balances: [
            {
                address: contract.userAccount.address,
                amount: "1000000000000"
            }
        ],
        mint: {
            minter: contract.userAccount.address,
            cap: "1000000000000000000000000000"
        }
    };

    // instantiate new cw20_base contract
    await contract.instantiate(initMsg);
}

main();
