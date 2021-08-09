// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Enum, Option, Struct, bool, u128 } from '@polkadot/types';
import type { ITuple } from '@polkadot/types/types';
import type { Signature } from '@polkadot/types/interfaces/extrinsics';
import type { AccountId, Balance, H160, H256, Index } from '@polkadot/types/interfaces/runtime';

/** @name AssetId */
export interface AssetId extends Enum {
  readonly isPolkadex: boolean;
  readonly isDot: boolean;
  readonly isChainsafe: boolean;
  readonly asChainsafe: H160;
  readonly isBtc: boolean;
  readonly isUsd: boolean;
}

/** @name balanceSetBalanceArgs */
export interface balanceSetBalanceArgs extends ITuple<[AccountId, AccountId, Balance, Balance]> {}

/** @name balanceShieldArgs */
export interface balanceShieldArgs extends ITuple<[AccountId, Balance]> {}

/** @name balanceTransferArgs */
export interface balanceTransferArgs extends ITuple<[AccountId, AccountId, Balance]> {}

/** @name balanceUnshieldArgs */
export interface balanceUnshieldArgs extends ITuple<[AccountId, AccountId, Balance, ShardIdentifier]> {}

/** @name CancelOrder */
export interface CancelOrder extends Struct {
  readonly user_uid: UserId;
  readonly market_id: MarketId;
  readonly order_id: OrderUUID;
}

/** @name CancelOrderArgs */
export interface CancelOrderArgs extends ITuple<[AccountId, CancelOrder, Option<AccountId>]> {}

/** @name CurrencyId */
export interface CurrencyId extends AssetId {}

/** @name DirectRequest */
export interface DirectRequest extends Struct {
  readonly shard: ShardIdentifier;
  readonly encoded_text: Bytes;
}

/** @name DirectRequestStatus */
export interface DirectRequestStatus extends Enum {
  readonly isOk: boolean;
  readonly isTrustedOperationStatus: boolean;
  readonly asTrustedOperationStatus: TrustedOperationStatus;
  readonly isError: boolean;
}

/** @name Getter */
export interface Getter extends Enum {
  readonly isPublic: boolean;
  readonly asPublic: PublicGetter;
  readonly isTrusted: boolean;
  readonly asTrusted: TrustedGetterSigned;
}

/** @name MarketId */
export interface MarketId extends Struct {
  readonly base: AssetId;
  readonly quote: AssetId;
}

/** @name Order */
export interface Order extends Struct {
  readonly user_uid: UserId;
  readonly market_id: MarketId;
  readonly market_type: Bytes;
  readonly order_type: OrderType;
  readonly side: OrderSide;
  readonly quantity: u128;
  readonly price: Option<u128>;
}

/** @name OrderSide */
export interface OrderSide extends Enum {
  readonly isBid: boolean;
  readonly isAsk: boolean;
}

/** @name OrderType */
export interface OrderType extends Enum {
  readonly isLimit: boolean;
  readonly isMarket: boolean;
  readonly isPostOnly: boolean;
  readonly isFillOrKill: boolean;
}

/** @name OrderUUID */
export interface OrderUUID extends Bytes {}

/** @name PlaceOrderArgs */
export interface PlaceOrderArgs extends ITuple<[AccountId, Order, Option<AccountId>]> {}

/** @name PublicGetter */
export interface PublicGetter extends Enum {
  readonly isSomeValue: boolean;
}

/** @name RpcReturnValue */
export interface RpcReturnValue extends Struct {
  readonly value: Bytes;
  readonly do_watch: bool;
  readonly status: DirectRequestStatus;
}

/** @name ShardIdentifier */
export interface ShardIdentifier extends H256 {}

/** @name TrustedCall */
export interface TrustedCall extends Enum {
  readonly isBalanceSetBalance: boolean;
  readonly asBalanceSetBalance: balanceSetBalanceArgs;
  readonly isBalanceTransfer: boolean;
  readonly asBalanceTransfer: balanceTransferArgs;
  readonly isBalanceUnshield: boolean;
  readonly asBalanceUnshield: balanceUnshieldArgs;
  readonly isBalanceShield: boolean;
  readonly asBalanceShield: balanceShieldArgs;
  readonly isPlaceOrder: boolean;
  readonly asPlaceOrder: PlaceOrderArgs;
  readonly isCancelOrder: boolean;
  readonly asCancelOrder: CancelOrderArgs;
  readonly isWithdraw: boolean;
  readonly asWithdraw: WithdrawArgs;
}

/** @name TrustedCallSigned */
export interface TrustedCallSigned extends Struct {
  readonly call: TrustedCall;
  readonly nonce: Index;
  readonly signature: Signature;
}

/** @name TrustedGetter */
export interface TrustedGetter extends Enum {
  readonly isFreeBalance: boolean;
  readonly asFreeBalance: AccountId;
  readonly isReservedBalance: boolean;
  readonly asReservedBalance: AccountId;
  readonly isNonce: boolean;
  readonly asNonce: AccountId;
  readonly isGetBalance: boolean;
  readonly asGetBalance: AccountId,CurrencyId,Option<AccountId>;
}

/** @name TrustedGetterSigned */
export interface TrustedGetterSigned extends Struct {
  readonly getter: TrustedGetter;
  readonly signature: Signature;
}

/** @name TrustedOperation */
export interface TrustedOperation extends Enum {
  readonly isIndirectCall: boolean;
  readonly asIndirectCall: TrustedCallSigned;
  readonly isDirectCall: boolean;
  readonly asDirectCall: TrustedCallSigned;
  readonly isGet: boolean;
  readonly asGet: Getter;
}

/** @name TrustedOperationStatus */
export interface TrustedOperationStatus extends Enum {
  readonly isSubmitted: boolean;
  readonly isFuture: boolean;
  readonly isReady: boolean;
  readonly isBroadcast: boolean;
  readonly isInSidechainBlock: boolean;
  readonly asInSidechainBlock: H256;
  readonly isRetracted: boolean;
  readonly isFinalityTimeout: boolean;
  readonly isFinalized: boolean;
  readonly isUsurped: boolean;
  readonly isDropped: boolean;
  readonly isInvalid: boolean;
}

/** @name UserId */
export interface UserId extends AccountId {}

/** @name WithdrawArgs */
export interface WithdrawArgs extends ITuple<[AccountId, CurrencyId, Balance, Option<AccountId>]> {}

export type PHANTOM_OCEX = 'ocex';
