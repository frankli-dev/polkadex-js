export const localNetwork = () => {
    return {
        chain: 'ws://127.0.0.1:9979',
        worker: 'ws://88.198.24.21:8020',
        mrenclave: '31kgJRyQ6Atu3bVwJEzcXLoMQRLJjgEnZNmhakq5gMQY',
        types: {
            ShardIdentifier: 'H256',
            UserId: 'AccountId',
            OrderUUID: 'Vec<u8>',
            Order: {
                user_uid: 'UserId',
                market_id: 'MarketId',
                market_type: 'Vec<u8>',
                order_type: 'OrderType',
                side: 'OrderSide',
                quantity: 'u128',
                price: 'Option<u128>'

            },
            CancelOrder: {
                user_uid: 'UserId',
                market_id: 'MarketId',
                order_id: 'OrderUUID'
            },
            OrderSide: {
                _enum: {
                    BID: null,
                    ASK: null
                }
            },
            OrderType: {
                _enum: {
                    LIMIT: null,
                    MARKET: null,
                    PostOnly: null,
                    FillOrKill: null
                }
            },
            AssetId: {
                _enum: {
                    POLKADEX: null,
                    DOT: null,
                    CHAINSAFE: 'H160',
                    BTC: null,
                    USD: null
                }
            },
            CurrencyId: 'AssetId',
            MarketId: {
                base: 'AssetId',
                quote: 'AssetId'
            },

            TrustedCall: {
                _enum: {
                    balance_set_balance: 'balanceSetBalanceArgs',
                    balance_transfer: 'balanceTransferArgs',
                    balance_unshield: 'balanceUnshieldArgs', // (AccountIncognito, BeneficiaryPublicAccount, Amount, Shard)
                    balance_shield: 'balanceShieldArgs',                               // (AccountIncognito, Amount)

                    place_order: 'PlaceOrderArgs', // (SignerAccount, Order, MainAccount (if signer is proxy))
                    cancel_order: 'CancelOrderArgs', // (SignerAccount, Order ID, MainAccount (if signer is proxy))
                    withdraw: 'WithdrawArgs', // (SignerAccount, TokenId, Quantity, MainAccount (if signer is proxy))
                }
            },
            balanceSetBalanceArgs: '(AccountId, AccountId, Balance, Balance)',
            balanceTransferArgs: '(AccountId, AccountId, Balance)',
            balanceUnshieldArgs: '(AccountId, AccountId, Balance, ShardIdentifier)',
            balanceShieldArgs: '(AccountId, Balance)',

            PlaceOrderArgs: '(AccountId, Order, Option<AccountId>)',
            CancelOrderArgs: '(AccountId, CancelOrder, Option<AccountId>)',
            WithdrawArgs: '(AccountId, CurrencyId, Balance, Option<AccountId>)',

            TrustedCallSigned: {
                call: 'TrustedCall',
                nonce: 'Index',
                signature: 'MultiSignature'
            },
            TrustedOperation: {
                _enum: {
                    indirect_call: 'TrustedCallSigned',
                    direct_call: 'TrustedCallSigned',
                    get: 'Getter'
                }
            },
            TrustedOperationStatus: {
                _enum:{
                    /// TrustedOperation is submitted to the top pool.
                    Submitted: null,
                    /// TrustedOperation is part of the future queue.
                    Future: null,
                    /// TrustedOperation is part of the ready queue.
                    Ready: null,
                    /// The operation has been broadcast to the given peers.
                    Broadcast: null,
                    /// TrustedOperation has been included in block with given hash.
                    InSidechainBlock: 'H256',
                    /// The block this operation was included in has been retracted.
                    Retracted: null,
                    /// Maximum number of finality watchers has been reached,
                    /// old watchers are being removed.
                    FinalityTimeout: null,
                    /// TrustedOperation has been finalized by a finality-gadget, e.g GRANDPA
                    Finalized: null,
                    /// TrustedOperation has been replaced in the pool, by another operation
                    /// that provides the same tags. (e.g. same (sender, nonce)).
                    Usurped: null,
                    /// TrustedOperation has been dropped from the pool because of the limit.
                    Dropped: null,
                    /// TrustedOperation is no longer valid in the current state.
                    Invalid: null,
                }
            },
            DirectRequestStatus: {
                _enum: {
                    Ok: null,
                    TrustedOperationStatus: 'TrustedOperationStatus',
                    Error: null
                }
            },
            RpcReturnValue: {
                value: 'Vec<u8>',
                do_watch: 'bool',
                status: 'DirectRequestStatus'
            },
            DirectRequest: {
                shard: 'ShardIdentifier',
                encoded_text: 'Vec<u8>'
            },
            Getter: {
                _enum: {
                    public: 'PublicGetter',
                    trusted: 'TrustedGetterSigned'
                }
            },
            PublicGetter: {
                _enum: {
                    some_value: null
                }
            },
            TrustedGetterSigned: {
                getter: 'TrustedGetter',
                signature: 'Signature'
            },
            TrustedGetter: {
                _enum: {
                    free_balance: 'AccountId',
                    reserved_balance: 'AccountId',
                    nonce: 'AccountId',
                    get_balance: 'AccountId, CurrencyId, Option<AccountId>'
                }
            }
        }
    };
};