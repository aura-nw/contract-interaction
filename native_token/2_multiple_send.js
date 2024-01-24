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

    // declare list of recipients
    const recipients = [
        {
            address: "aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrt",
            amount: 1000000
        },
        {
            address: "aura19cwvaptcmw25z4qhq3a50whcdl8k46n6ttjmln",
            amount: 2000000
        },
        {
            address: "aura1eshnymh9xzltr85caa5pl0pkmdvl09hseyqg4k",
            amount: 3000000
        },
    ];

    // execute multiple send token
    await contract.multi_send_token(recipients);
}

main();
