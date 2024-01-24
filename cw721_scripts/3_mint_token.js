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

    // prepare mint message
    const mintMsg = {
        mint: {
            token_id: "abc1234",
            owner: contract.userAccount.address,
            token_uri: "https://ipfs.io/ipfs/bafkreidaywcdmkcjprbnxgsubau4d5nsrsq7672et47ppm2vww76w74nxu"
        }
    };

    // execute mint message
    await contract.execute(mintMsg);
}

main();
