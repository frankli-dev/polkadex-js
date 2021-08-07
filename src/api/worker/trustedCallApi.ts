import {KeyringPair} from "@polkadot/keyring/types";
import {u32} from "@polkadot/types";
import {
    CancelOrderArgs, DirectRequest,
    PlaceOrderArgs,
    TrustedCallSigned,
    TrustedOperation,
    WithdrawArgs
} from "../../types/interfaces";
import {IPolkadexWorker} from "./interface";
import bs58 from "bs58";
import {localNetwork} from "../../../tests/worker/localNetwork";

export type TrustedCallArgs = (PlaceOrderArgs | CancelOrderArgs | WithdrawArgs);

export type TrustedCallVariant = [string, string]
export type TrustedOperationVariant = [string, string]

export const createTrustedCall = (
    self: IPolkadexWorker,
    trustedCall: TrustedCallVariant,
    accountOrPubKey: KeyringPair,
    mrenclave: string,
    nonce: u32,
    params: TrustedCallArgs
): TrustedCallSigned => {

    const [variant, argType] = trustedCall;
    const hash = self.createType('Hash', bs58.decode(mrenclave));

    const call = self.createType('TrustedCall', {
        [variant]: self.createType(argType, params)
    });

    return self.createType('TrustedCallSigned', {
        call: call,
        nonce: nonce,
        signature: accountOrPubKey.sign(call.toU8a())
    });
}

export const createTrustedOperation = (
    self: IPolkadexWorker,
    trustedOperation: TrustedOperationVariant,
    signedCall: TrustedCallSigned
): TrustedOperation => {
    const [variant, argType] = trustedOperation;
    return self.createType('TrustedOperation', {
        [variant]: self.createType(argType, signedCall)
    });
}

export const createDirectRequest = (
    self: IPolkadexWorker,
    trustedOperation: TrustedOperation,
    mrenclave: string
): DirectRequest => {
    const shard = self.createType("ShardIdentifier", bs58.decode(mrenclave));
    const encoded_txt = self.createType("Vec<u8>", trustedOperation.toHex());
    return self.createType("DirectRequest", [shard, encoded_txt])
}