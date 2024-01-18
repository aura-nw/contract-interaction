'use strict';

const devnet = {
    rpcEndpoint: 'https://rpc.dev.aura.network',
    prefix: 'aura',
    denom: 'utaura',
    chainId: 'aura-testnet',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000
};

const serenity = {
    rpcEndpoint: 'https://rpc.serenity.aura.network',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'serenity-testnet-001',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000
};

const euphoria = {
    rpcEndpoint: 'https://rpc.euphoria.aura.network',
    prefix: 'aura',
    denom: 'ueaura',
    chainId: 'euphoria-2',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000
};

const mainnet = {
    rpcEndpoint: 'https://rpc.aura.network',
    prefix: 'aura',
    denom: 'uaura',
    chainId: 'xstaxy-1',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000
};

let CHAINS = {
    devnet,
    serenity,
    euphoria,
    mainnet,
};

module.exports = CHAINS;