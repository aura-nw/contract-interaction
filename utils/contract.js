'use strict';
const fs = require('fs');
const path = require("path");
const { toUtf8 } = require('@cosmjs/encoding');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet, coin } = require('@cosmjs/proto-signing');
const { calculateFee, GasPrice } = require('@cosmjs/stargate');

class ExecuteMsg {
    constructor(msg, native_amount = 0, native_denom = "") {
        this.msg = msg;
        this.native_amount = native_amount;
        this.native_denom = native_denom;
    }
}

class Contract {
    async init(chainConfig, mnemonic, codeId = 0, contractAddress = "") {
        this.executeMsgs = [];
        this.queryMsgs = [];

        this.chainConfig = chainConfig;

        this.codeId = codeId;

        this.contractAddress = contractAddress;

        // gas price
        this.gasPrice = GasPrice.fromString(`0.025${this.chainConfig.denom}`);
        let userWallet = await DirectSecp256k1HdWallet.fromMnemonic(
            mnemonic,
            {
                prefix: this.chainConfig.prefix
            }
        );
        this.userClient = await SigningCosmWasmClient.connectWithSigner(this.chainConfig.rpcEndpoint, userWallet, { gasPrice: this.gasPrice });
        this.userAccount = (await userWallet.getAccounts())[0];

        return this;
    }

    async store_code(wasm_file, gasLimit = 2600000) {
        // store_code function is used only once, so if codeId is not 0, then the code is already stored
        if (this.codeId != 0) {
            console.log("Contract code exists");
            return;
        }
        const uploadFee = calculateFee(gasLimit, this.gasPrice);
        const contractCode = fs.readFileSync(path.resolve(__dirname, `${wasm_file}`));

        console.log(`Storing new code...`);
        const storeCodeResponse = await this.userClient.upload(this.userAccount.address, contractCode, uploadFee, 'Upload contract code');

        console.log("  transactionHash: ", storeCodeResponse.transactionHash);
        console.log("  codeId: ", storeCodeResponse.codeId);
        console.log("  gasUsed / gasWanted: ", storeCodeResponse.gasUsed, " / ", storeCodeResponse.gasWanted);

        this.codeId = storeCodeResponse.codeId;
        return storeCodeResponse;
    }

    async migrate(migrateMsg, codeId, gasLimit = 2600000) {
        // if contractAddress is empty, then the contract is not instantiated
        if (this.contractAddress == "") {
            console.log("Contract NOT instantiated");
            return;
        }

        const migrateFee = calculateFee(gasLimit, this.gasPrice);

        console.log(`Migrating contract...`);
        const migrateResponse = await this.userClient.migrate(
            this.userAccount.address,
            this.contractAddress,
            codeId,
            migrateMsg,
            migrateFee,
            'Migrate contract',
        );

        console.log("  transactionHash: ", migrateResponse.transactionHash);
        console.log("  gasUsed / gasWanted: ", migrateResponse.gasUsed, " / ", migrateResponse.gasWanted);

        this.codeId = codeId;
        return migrateResponse;
    }

    async instantiate(instantiateMsg, admin = "") {
        // if codeId is 0, then the code is not stored
        if (this.codeId == 0) {
            console.log("Contract code NOT exists");
            return;
        }

        // if contractAddress is not empty, then the contract is already instantiated
        if (this.contractAddress != "") {
            console.log("Contract already instantiated");
            return;
        }

        // if admin is empty, then the user is the admin
        if (admin == "") {
            admin = this.userAccount.address;
        }

        console.log("Instantiating contract...");

        //Instantiate the contract
        const instantiateResponse = await this.userClient.instantiate(
            this.userAccount.address,
            Number(this.codeId),
            instantiateMsg,
            "instantiation contract",
            "auto",
            { admin: admin }
        );
        console.log("  transactionHash: ", instantiateResponse.transactionHash);
        console.log("  contractAddress: ", instantiateResponse.contractAddress);
        console.log("  gasUsed / gasWanted: ", instantiateResponse.gasUsed, " / ", instantiateResponse.gasWanted);

        this.contractAddress = instantiateResponse.contractAddress;
    }

    async execute(executeMsg, memo = "", native_amount = 0, native_denom = this.chainConfig.denom) {
        // if contractAddress is empty, then the contract is not instantiated
        if (this.contractAddress == "") {
            console.log("Contract NOT instantiated");
            return;
        }

        console.log("Executing message to contract...");

        let executeResponse;

        // if the native amount is not 0, then send the native token to the contract
        if (native_amount != 0) {
            executeResponse = await this.userClient.execute(
                this.userAccount.address,
                this.contractAddress,
                executeMsg,
                "auto",
                memo,
                [coin(native_amount, native_denom)],
            );
        } else {
            executeResponse = await this.userClient.execute(
                this.userAccount.address,
                this.contractAddress,
                executeMsg,
                "auto",
                memo,
            );
        }

        console.log("  transactionHash: ", executeResponse.transactionHash);
        console.log("  gasUsed / gasWanted: ", executeResponse.gasUsed, " / ", executeResponse.gasWanted);

        return executeResponse;
    }

    async execute_multi_msgs(executeMsgs, memo = "", native_amount = 0, native_denom = this.chainConfig.denom) {
        // we accept only maximum 100 messages
        if (executeMsgs.length > 100) {
            console.log("Too many messages, max 100 messages allowed");
            return;
        }

        let exec_messages = [];
        executeMsgs.forEach(message => {
            if (message.native_amount != 0) {
                let broadcast_mess = {
                    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                    value: {
                        sender: this.userAccount.address,
                        contract: this.contractAddress,
                        msg: toUtf8(JSON.stringify(message.msg)),
                        funds: [coin(String(message.native_amount), message.native_denom)],
                    }
                }
                exec_messages.push(broadcast_mess);
            } else {
                let broadcast_mess = {
                    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                    value: {
                        sender: this.userAccount.address,
                        contract: this.contractAddress,
                        msg: toUtf8(JSON.stringify(message.msg)),
                    }
                }
                exec_messages.push(broadcast_mess);
            }

        });

        console.log("Executing messages to contract...");
        let executeResponse = await this.userClient.signAndBroadcast(this.userAccount.address, exec_messages, 'auto', memo);

        console.log("  transactionHash: ", executeResponse.transactionHash);
        console.log("  gasUsed / gasWanted: ", executeResponse.gasUsed, " / ", executeResponse.gasWanted);

        return executeResponse;
    }

    async query(queryMsg) {
        console.log("Querying contract...");

        const queryResponse = await this.userClient.queryContractSmart(this.contractAddress, queryMsg);

        console.log("  Querying successful");

        return queryResponse;
    }

    async send_token(recipient, amount, denom = this.chainConfig.denom) {
        console.log("Sending token...");
        const sendResponse = await this.userClient.sendTokens(
            this.userAccount.address,
            recipient,
            [coin(amount, denom)],
            'auto'
        );

        console.log("  transactionHash: ", sendResponse.transactionHash);
        console.log("  gasUsed / gasWanted: ", sendResponse.gasUsed, " / ", sendResponse.gasWanted);

        return sendResponse;
    }

    async multi_send_token(recipients, denom = this.chainConfig.denom) {
        let total_amount = 0;
        let outputs = [];
        for (let i = 0; i < recipients.length; i++) {
            outputs.push({
                address: recipients[i].address,
                coins: [coin(recipients[i].amount, denom)],
            });
            total_amount += recipients[i].amount;
        }

        let inputs = [
            {
                address: this.userAccount.address,
                coins: [coin(total_amount, denom)],
            }
        ];

        let broadcast_mess = {
            typeUrl: '/cosmos.bank.v1beta1.MsgMultiSend',
            value: {
                inputs: inputs,
                outputs: outputs,
            }
        }

        console.log("Sending tokens...");
        let sendResponse = await this.userClient.signAndBroadcast(this.userAccount.address, [broadcast_mess], 'auto');

        console.log("  transactionHash: ", sendResponse.transactionHash);
        console.log("  gasUsed / gasWanted: ", sendResponse.gasUsed, " / ", sendResponse.gasWanted);

        return sendResponse;
    }
}

module.exports = {
    Contract: Contract,
    ExecuteMsg: ExecuteMsg
};