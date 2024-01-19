const CHAINS = require('../config/chains');
const { Contract, ExecuteMsg } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1axljfzc0rjge3zq3jgg4ehtq7el2r4zga0z8g7rj4v9kpwsyk9vsauue0v");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // declare list of recipients
    const recipients = [
        "aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrt",
        "aura19cwvaptcmw25z4qhq3a50whcdl8k46n6ttjmln",
        "aura1eshnymh9xzltr85caa5pl0pkmdvl09hseyqg4k"
    ];

    // prepare list of transfer messages
    let transferMsgs = [];
    recipients.forEach((recipient) => {
        let transferMsg = new ExecuteMsg();
        transferMsg.msg = {
            transfer: {
                recipient: recipient,
                amount: "1000000"
            }
        };

        transferMsgs.push(transferMsg);
    });

    // execute transfer message
    await contract.execute_multi_msgs(transferMsgs);
}

main();
