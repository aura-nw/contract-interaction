'use strict';
const fs = require('fs');

const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet, coin } = require('@cosmjs/proto-signing');
const { calculateFee, GasPrice } = require('@cosmjs/stargate');

class Contract {
    static async init(chainConfig, mnemonic, codeId = 0, contractAddress = "") {
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
        const contractCode = fs.readFileSync(`${wasm_file}`);

        console.log(`Storing new code...`);
        const storeCodeResponse = await this.userClient.upload(this.userAccount.address, contractCode, uploadFee, 'Upload contract code');

        console.log("  transactionHash: ", storeCodeResponse.transactionHash);
        console.log("  codeId: ", storeCodeResponse.codeId);
        console.log("  gasUsed / gasWanted: ", storeCodeResponse.gasUsed, " / ", storeCodeResponse.gasWanted);

        this.codeId = storeCodeResponse.codeId;
    }

    async instantiate(instantiateMsg) {
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

        console.log("Instantiating contract...");

        //Instantiate the contract
        const instantiateResponse = await this.userClient.instantiate(
            this.userAccount.address,
            Number(this.codeId),
            instantiateMsg,
            "instantiation contract",
            "auto",
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

    async query(queryMsg) {
        console.log("Querying contract...");

        const queryResponse = await this.userClient.queryContractSmart(this.contractAddress, queryMsg);

        console.log("  Querying successful");

        return queryResponse;
    }
}

module.exports = Contract;