export const localNetwork = () => {
    return {
        chain: 'ws://127.0.0.1:9979',
        worker: 'ws://127.0.0.1:2079',
        mrenclave: '5PgBS5zCJdy3Zb6LMS4iU9jhZEjuLZHJZNCu7V13xMKe',
        types: {
            ShardIdentifier: 'Hash',
            UserId: 'AccountId',
            Order: {
                user_uid: 'UserId',
                market_id: 'MarketId',
                market_type: 'Vec<u8>',
                order_type: 'OrderType',
                side: 'OrderSide',
                quantity: 'u128',
                price: 'Option<u128>'

            },
            CancelOrder: {},
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
                signature: 'Signature'
            },
            TrustedOperation: {
                _enum: {
                    indirect_call: 'TrustedCallSigned',
                    direct_call: 'TrustedCallSigned',
                    get: 'Getter'
                }
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