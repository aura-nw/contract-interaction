This folder contains the scripts to interact with the cw721 contracts. The wasms (v0.18.0) are used in these script building based on the [cw-nfts](https://github.com/CosmWasm/cw-nfts) commit [378ae39](https://github.com/CosmWasm/cw-nfts/commit/378ae39db7bfcdb09660955ef1334a5304c3d633) with `optimizer_version` is `0.13.0`.

The checksums of the wasms are listed below:
| ID  | File             | Checksum                                                         |
| --- | ---------------- | ---------------------------------------------------------------- |
| 1   | cw721_base.wasm  | dd8cba03a60d7c499e0df3f0ae6a31d9b6b974d0c5755244fac58118f2a2d6e5 |
| 2   | hello_cw721.wasm | b839ed9091f2d2da09b7d79d001c63e3026aa5b606c4a132daa8a1869603a074 |

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Store contract code](#store-contract-code)
- [Instantiate contractk](#instantiate-contractk)
- [Execute contract](#execute-contract)
  - [Single executing transaction](#single-executing-transaction)
  - [Multiple executing transaction](#multiple-executing-transaction)
- [Query contract](#query-contract)

## Store contract code
The [storing script](./1_store_code.js) requires only one argument which is the path to the contract wasm file. The script will return the code id of the contract.

## Instantiate contractk
The [instantiating script](./2_instantiate_contract.js) requires two arguments: the code id of the contract and the init message. The init message `initMsg` is used in this script based on the requirements of cw721-base contract version 0.18.0. It includes the `name`, `symbol` and `minter` fields. Additionally, in this version, cw721-base allows you to add the `withdraw_address` field to the init message to set a wallet that can withdraw all native token in contract.
```javascript
const initMsg = {
    name: "CW721 Token on Euphoria",
    symbol: "CTE",
    minter: contract.userAccount.address,
}
```

## Execute contract
The executing scripts include:
- [mint token](./3_mint_token.js)
- [send token](./5.2_send_token.js)
- [multiple mint token](./4_multiple_mint_token.js)

### Single executing transaction
The first two scripts are single executing transactions. This means there is only one message in the transaction (note that, before running [send token](./5.2_send_token.js), you can store and instantiate new `RECEIPENT_CONTRACT` by using [setup hello cw721](./5.1_setup_hello_cw721.js)). The executing message in the scripts (corresponding `mintMsg` and `sendMsg` in the scripts) can be changed by the others execute messages of cw721-base contract in the following list:

1. Transfer NFT having `TOKEN_ID` (String) from user account to `RECEIPIENT` (Address) account
   ```javascript
    const transferMsg = {
        transfer_nft: {
            recipient: RECEIPIENT,
            token_id: TOKEN_ID
        }
    }
   ```
2. Send NFT having `TOKEN_ID` (String) from user account to `CONTRACT` (Address) contract and require the contract to process the message `MSG` (encoded base64 Json string of the message)
   ```javascript
    const sendMsg = {
        send_nft: {
            contract: CONTRACT,
            token_id: TOKEN_ID,
            msg: MSG
        }
    }
   ```
3. Approve `SPENDER` (Address) to control (send/transfer) NFT having `TOKEN_ID` (String) of user account with the expiration time `EXPIRES` (optional, cw721::Expiration). Note that the `EXPIRES` can be `at_height` (block height) or `at_time` (timestamp) or `never`.
   ```javascript
    const approveMsg = {
        approve: {
            spender: SPENDER,
            token_id: TOKEN_ID,
            expires: EXPIRES
        }
    }
   ```
4. Revoke `SPENDER` (Address) to control (send/transfer) NFT having `TOKEN_ID` (String) of user account
   ```javascript
    const revokeMsg = {
        revoke: {
            spender: SPENDER,
            token_id: TOKEN_ID
        }
    }
   ```
5. Approve `OPERATOR` (Address) to control (send/transfer) add NFTs of user account with the expiration time `EXPIRES` (optional, cw721::Expiration). Note that the `EXPIRES` can be `at_height` (block height) or `at_time` (timestamp) or `never`
   ```javascript
    const approveAllMsg = {
        approve_all: {
            operator: OPERATOR,
            expires: EXPIRES
        }
    }
   ```
6. Revoke `SPENDER` (Address) to control (send/transfer) add NFT of user account
   ```javascript
    const revokeAllMsg = {
        revoke_all: {
            spender: SPENDER
        }
    }
   ```
7. Mint new NFT having token id is `TOKEN_ID` (String) to `OWNER` (Address) with data is `token_uri` (optional, String) and `extension` (optional, predefined type), requires the sender to have the minter role
   ```javascript
    const mintMsg = {
        mint: {
            token_id: TOKEN_ID,
            owner: OWNER,
            token_uri: TOKEN_URI,
            extension: EXTENSION
        }
    }
   ```
8. Burn NFT having token id is `TOKEN_ID` (String), requires the NFT to be owned by the sender or approved to the sender
   ```javascript
    const burnMsg = {
        burn: {
            token_id: TOKEN_ID,
        }
    }
   ``` 

### Multiple executing transaction
The [last script](./4_multiple_mint_token.js) is multiple executing transactions. This means there are multiple separate messages in the transaction. Each `mintMsg` in `mintMsgs` array must follows the structure:
```javascript
let mintMsg = {
    msg = MSG;
    native_amount = AMOUNT;
    native_denom = DENOM;
}
```
The `MSG` is the Json message of the executing message. It can be one of the messages in the single executing transaction list above. The `AMOUNT` (optional, String) and `DENOM` (optional, String) are the information of funds to be sent to the contract for this executing message. If the `AMOUNT` is not set, the default value is `0`. If the `DENOM` is not set, the default value is empty. This means there is no fund to be sent to the contract for this executing message.

## Query contract
The [querying script](./6_query_contract.js) requires `queryMsg` as the cw721 query message. The `queryMsg` can be one of the following messages:
1. Owner of NFT having `TOKEN_ID` (String) with the `include_expired` (optional, bool) to include the expiration of approvals. If `include_expired` is not set, the default value is `false`.
    ```javascript
    const queryMsg = {
        owner_of: {
            token_id: TOKEN_ID,
            include_expired: false
        }
    }
    ```
2. Check if `SPENDER` (Address) has permission to control NFT having `TOKEN_ID` (String) or not with the `include_expired` (optional, bool) to include the expiration of approvals. If `include_expired` is not set, the default value is `false`.
    ```javascript
    const queryMsg = {
        approval: {
            token_id: TOKEN_ID,
            spender: SPENDER,
            include_expired: false
        }
    }
    ```
3. Retrieve all approvals that a token with `TOKEN_ID` (String) has. The parameter `include_expired` (optional, bool) is used to include the expiration status of approvals. If `include_expired` is not set, the default value is `false`
    ```javascript
    const queryMsg = {
        approvals: {
            token_id: TOKEN_ID,
            include_expired: false
        }
    }
    ```
4. Check if an `OPERATOR` can control NFTs of `OWNER` (Address) or not. The `include_expired` (optional, bool) is used to include the expiration status of approvals. If `include_expired` is not set, the default value is `false`
    ```javascript
    const queryMsg = {
        operator: {
            owner: OWNER,
            operator: OPERATOR,
            include_expired: false
        }
    }
    ```
5. Retrieve all approvals can control NFTs of `OWNER`. The `include_expired` (optional, bool) is used to include the expiration status of approvals. If `include_expired` is not set, the default value is `false`. The `start_after` (optional, String) is the operator to start after (exclusive), the `limit` (optional, u32) is the maximum number of results to return. If `limit` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        all_operators: {
            owner: OWNER,
            include_expired: false
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
6. Total number of NFTs issued
    ```javascript
    const queryMsg = {
        num_tokens: {}
    }
    ```
7. Information (`name` and `symbol`) of contract
    ```javascript
    const queryMsg = {
        contract_info: {}
    }
    ```
8. Information (`token_uri` and `extension`) of NFT having `TOKEN_ID` (String)
    ```javascript
    const queryMsg = {
        nft_info: {
            token_id: TOKEN_ID
        }
    }
    ```
9. All information (`token_uri`, `extension`, `owner` and all `approval`) of NFT having `TOKEN_ID` (String) with the `include_expired` (optional, bool) to include the expiration of approvals. If `include_expired` is not set, the default value is `false`.
    ```javascript
    const queryMsg = {
        all_nft_infos: {
            token_id: TOKEN_ID,
            include_expired: false
        }
    }
    ```
10. All NFTs owned by `OWNER` (Address). The `start_after` (optional, String) is the token id to start after (exclusive), the `limit` (optional, u32) is the maximum number of results to return. If `limit` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        tokens: {
            owner: OWNER,
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
11. All NFTs are issued by contract. The `start_after` (optional, String) is the token id to start after (exclusive), the `limit` (optional, u32) is the maximum number of results to return. If `limit` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        all_tokens: {
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
12. Minter of the contract
    ```javascript
    const queryMsg = {
        minter: {}
    }
    ```