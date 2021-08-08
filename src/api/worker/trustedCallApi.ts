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
    const mrenclave_scale_type = self.createType('Hash', bs58.decode(mrenclave));

    const call = self.createType('TrustedCall', {
        [variant]: self.createType(argType, params)
    });

    let payload = new Uint8Array([call.toU8a(), nonce.toU8a(), mrenclave_scale_type.toU8a(), mrenclave_scale_type.toU8a() ]);
    // payload for signing = call + nonce + mrenclave + shard
    // How it's done in rust
    // let mut payload = self.encode();
    // payload.append(&mut nonce.encode());
    // payload.append(&mut mrenclave.encode());
    // payload.append(&mut shard.encode());
    // NOTE: For now, MRENCLAVE==SHARD

    return self.createType('TrustedCallSigned', {
        call: call,
        nonce: nonce,
        signature: accountOrPubKey.sign(payload)
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