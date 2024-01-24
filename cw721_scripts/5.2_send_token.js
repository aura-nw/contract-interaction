const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    const RECEIPENT_CONTRACT = "aura16svrhjg5rl90uhew5ea4vxat7undsky5pn5pjglx6egg3wd72l7q0sd93l";

    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1dpetprskh7mkgq9svg04a2vh8043950kwlv2p3zg03mz4yv08nzqjpek7s");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // prepare cw721_hook_msg
    const cw721_hook_msg = {
        hello: {
            message: "Hello from hoanm, this is cw721_hook_msg"
        }
    };

    // prepare send message
    // maybe you need to change token_id
    const sendMsg = {
        send_nft: {
            contract: RECEIPENT_CONTRACT,
            token_id: "abc1234",
            msg: Buffer.from(JSON.stringify(cw721_hook_msg)).toString('base64')
        }
    };

    // execute send message
    await contract.execute(sendMsg);
}

main();
