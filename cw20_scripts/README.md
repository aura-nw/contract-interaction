This folder contains the scripts to interact with the cw20 contracts. The wasms (v1.1.2) are used in these script building based on the [cw-plus](https://github.com/CosmWasm/cw-plus/tree/main) commit [1a598fd](https://github.com/CosmWasm/cw-plus/commit/1a598fd99f788e1f0a2d735ff7d19571ca70205c) with `optimizer_version` is `0.13.0`.

The checksums of the wasms are listed below:
| ID  | File            | Checksum                                                         |
| --- | --------------- | ---------------------------------------------------------------- |
| 1   | cw20_base.wasm  | b460b30d218b3bbd6e7f77a917c85f2352714d63d611601811c77056c985b180 |
| 2   | cw20_ics20.wasm | d2aaf86f9b2edba244fad10ae4025e3d4e09b07b5afb135d68721d9257d64ca3 |
| 3   | hello_cw20.wasm | 759b7f2b25411e28d063cb603a33d6207498585ef6e740f0836cedb7f8344cd4 |

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
The [instantiating script](./2_instantiate_contract.js) requires two arguments: the code id of the contract and the init message. The init message `initMsg` is used in this script based on the requirements of cw20-base contract version 1.1.2. It includes the `name`, `symbol`, `decimals`, `initial_balances` and `mint` fields. Additionally, you can add the `marketing` field to the init message to set the marketing information for token.
```json
{
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
}
```

## Execute contract
The executing scripts include:
- [transfer token](./3_transfer_token.js)
- [send token](./5_send_token.js)
- [multiple transfer token](./4_multiple_transfer_token.js)

### Single executing transaction
The first two scripts are single executing transactions. This means there is only one message in the transaction. You can change the executing message in the scripts (corresponding `transferMsg` and `sendMsg` in the scripts) by the others execute messages of cw20-base contract in the following list:

1. Transfer `AMOUNT` (String) tokens from user account to `RECEIPIENT` (Address) account
   ```javascript
    const transferMsg = {
    transfer: {
        recipient: RECEIPIENT,
        amount: AMOUNT
    }
    }
   ```
2. Burn `AMOUNT` (String) tokens of user
   ```javascript
    const burnMsg = {
    burn: {
        amount: AMOUNT
    }
    }
   ```
3. Send `AMOUNT` (String) tokens from user account to `CONTRACT` (Address) contract and require the contract to process the message `MSG` (encoded base64 Json string of the message)
   ```javascript
    const sendMsg = {
        send: {
            contract: CONTRACT,
            amount: AMOUNT,
            msg: MSG
        }
    }
   ```
4. Mint `AMOUNT` (String) tokens to `RECEIPIENT` (Address) account, requires the sender to have the minter role
   ```javascript
    const mintMsg = {
        mint: {
            recipient: RECEIPIENT,
            amount: AMOUNT
        }
    }
   ```
5. Increase the allowance of `SPENDER` (Address) to use `AMOUNT` (String) tokens from the sender's account, which expires at `EXPIRES` (cw20::Expiration) time (optional). Note that the `EXPIRES` can be `at_height` (block height) or `at_time` (timestamp) or `never`.
   ```javascript
    const increaseAllowanceMsg = {
        increase_allowance: {
            spender: SPENDER,
            amount: AMOUNT,
            expires: EXPIRES
        }
    }
   ```
6. Decrease the allowance of `SPENDER` (Address) to use `AMOUNT` (String) tokens from the sender's account, which expires at `EXPIRES` (cw20::Expiration) time (optional). The `EXPIRES` same as the `increase_allowance`.
   ```javascript
    const decreaseAllowanceMsg = {
        decrease_allowance: {
            spender: SPENDER,
            amount: AMOUNT,
            expires: EXPIRES
        }
    }
   ```
7. Transfer `AMOUNT` (String) tokens from `OWNER` (Address) account to `RECEIPIENT` (Address) account, which is allowed to use `AMOUNT` tokens from `OWNER` account. This message is ussually called by a contract having the allowance of `OWNER` account.
   ```javascript
    const transferFromMsg = {
        transfer_from: {
            owner: OWNER,
            recipient: RECEIPIENT,
            amount: AMOUNT
        }
    }
   ```
8. Burn `AMOUNT` (String) tokens of `OWNER` (Address) account, which is allowed to use `AMOUNT` tokens from `OWNER` account. This message is ussually called by a contract having the allowance of `OWNER` account.
   ```javascript
    const burnFromMsg = {
        burn_from: {
            owner: OWNER,
            amount: AMOUNT
        }
    }
   ```
9. Send `AMOUNT` (String) tokens from `OWNER` (Address) account to `CONTRACT` (Address) contract and require that contract to process the message `MSG` (encoded base64 Json string of the message). The sender is a contract that be allowed to use `AMOUNT` tokens from `OWNER` account and having the allowance of `OWNER` account.
   ```javascript
    const sendFromMsg = {
        send_from: {
            owner: OWNER,
            contract: CONTRACT,
            amount: AMOUNT,
            msg: MSG
        }
    }
   ```
10. Update the marketing information of the token. The `PROJECT` (optional, String) is the URL pointing to the project behind the token, the `DESCRIPTION` (optional, String) is the description of the project and the `MARKETING` (optional, Address) is the address people who can update this data structure.
    ```javascript
    const updateMarketingMsg = {
        update_marketing: {
            project: PROJECT,
            description: DESCRIPTION,
            marketing: MARKETING
        }
    }
    ```
11. Update the logo of the token (if `marketing` is set before). The `LOGO` (String or encoded based64 SVG, PNG) is the logo of token.
    ```javascript
    const updateLogoMsg = {
        update_logo: {
            logo: LOGO
        }
    }
    ```
12. Update the minter of the token. The `NEW_MINTER` (Address) is the new minter of the token.
    ```javascript
    const updateMinterMsg = {
        update_minter: {
            new_minter: NEW_MINTER
        }
    }
    ```
### Multiple executing transaction
The [last script](./4_multiple_transfer_token.js) is multiple executing transactions. This means there are multiple separate messages in the transaction. Each `message` in `transferMsgs` array must follows the structure:
```javascript
let execMsg = {
    msg = MSG;
    native_amount = AMOUNT;
    native_denom = DENOM;
}
```
The `MSG` is the Json message of the executing message. It can be one of the messages in the single executing transaction list above. The `AMOUNT` (optional, String) and `DENOM` (optional, String) are the information of funds to be sent to the contract for this executing message. If the `AMOUNT` is not set, the default value is `0`. If the `DENOM` is not set, the default value is empty. This means there is no fund to be sent to the contract for this executing message.

## Query contract
The [querying script](./6_query_contract.js) requires `queryMsg` as the cw20 query message. The `queryMsg` can be one of the following messages:
1. Balance of `ADDRESS` (Address) account
    ```javascript
    const queryMsg = {
        balance: {
            address: ADDRESS
        }
    }
    ```
2. Cw20 token information
    ```javascript
    const queryMsg = {
        token_info: {}
    }
    ```
3. Minter information
    ```javascript
    const queryMsg = {
        minter: {}
    }
    ```
4. How much `SPENDER` (Address) can use from `OWNER` (Address) account
    ```javascript
    const queryMsg = {
        allowance: {
            owner: OWNER,
            spender: SPENDER
        }
    }
    ```
5. List all address can use from `OWNER` (Address) account. The `START_AFTER` (optional, String) is the address to start after (exclusive), the `LIMIT` (optional, u32) is the maximum number of results to return. If `LIMIT` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        all_allowances: {
            owner: OWNER,
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
6. List all address that allow `SPENDER` (Address) spends their token. The `START_AFTER` (optional, String) is the address to start after (exclusive), the `LIMIT` (optional, u32) is the maximum number of results to return. If `LIMIT` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        all_spender_allowances: {
            spender: SPENDER,
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
7. List all address that have balances (include the address have had balances in the past). The `START_AFTER` (optional, String) is the address to start after (exclusive), the `LIMIT` (optional, u32) is the maximum number of results to return. If `LIMIT` is not set, the default value is `10`.
    ```javascript
    const queryMsg = {
        all_accounts: {
            start_after: START_AFTER,
            limit: LIMIT
        }
    }
    ```
8. Marketing information, include the `description`, `logo` and `project` of the token.
    ```javascript
    const queryMsg = {
        marketing_info: {}
    }
    ```
9. Download logo data of the token (if stored on chain)
    ```javascript
    const queryMsg = {
        download_logo: {}
    }
    ```
