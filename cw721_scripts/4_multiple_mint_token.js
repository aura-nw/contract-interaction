const CHAINS = require('../config/chains');
const { Contract, ExecuteMsg } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1dpetprskh7mkgq9svg04a2vh8043950kwlv2p3zg03mz4yv08nzqjpek7s");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // declare list of recipients
    const recipients = [
        "aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrt",
        "aura19cwvaptcmw25z4qhq3a50whcdl8k46n6ttjmln",
        "aura1eshnymh9xzltr85caa5pl0pkmdvl09hseyqg4k"
    ];

    // prepare list of mint messages
    const TOKEN_ID_ALIAS = 1;   // note that maybe you must change this value due to the error: "token_id already claimed"
    let mintMsgs = [];
    for (let i = 0; i < recipients.length; i++) {
        let mintMsg = new ExecuteMsg();
        mintMsg.msg = {
            mint: {
                token_id: (i + TOKEN_ID_ALIAS).toString(),
                owner: recipients[i],
                token_uri: "ipfs://bafybeif2naoileyf572p6tkkuvbp2qtbzkjqwgofjwm3747wz5bo5ccblq/" + (i + TOKEN_ID_ALIAS).toString() + ".json"
            }
        };

        mintMsgs.push(mintMsg);
    }

    // execute mint message
    await contract.execute_multi_msgs(mintMsgs);
}

main();
