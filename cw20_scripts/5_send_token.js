const CHAINS = require('../config/chains');
const { Contract } = require('../utils/contract')

// load mnemonic from file
const fs = require('fs');
const path = require("path");
const mnemonic = fs.readFileSync(path.resolve(__dirname, `../.secret`)).toString().trim();

async function main() {
    const RECEIPENT_CONTRACT = "aura158hra4klt04ccuafglznflza4telxzlddjzvzszhr7umg23f02ws5ldf3z";

    let contract = new Contract();
    await contract.init(CHAINS.euphoria, mnemonic, 0, "aura1axljfzc0rjge3zq3jgg4ehtq7el2r4zga0z8g7rj4v9kpwsyk9vsauue0v");

    console.log("user address: ", contract.userAccount.address);
    console.log("contractAddress: ", contract.contractAddress);

    // prepare cw20_hook_msg
    const cw20_hook_msg = {
        hello: {
            message: "Hello from hoanm, this is cw20_hook_msg"
        }
    };

    // prepare send message
    const sendMsg = {
        send: {
            contract: RECEIPENT_CONTRACT,
            amount: "1000000",
            msg: Buffer.from(JSON.stringify(cw20_hook_msg)).toString('base64')
        }
    };

    // execute send message
    await contract.execute(sendMsg);
}

main();
