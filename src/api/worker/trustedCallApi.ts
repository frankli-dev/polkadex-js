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
    const mrenclave_codec_type = self.createType('Hash', mrenclave);

    const call = self.createType('TrustedCall', {
        [variant]: self.createType(argType, params)
    });

    // payload for signing = call + nonce + mrenclave + shard
    // How it's done in rust
    // let mut payload = self.encode();
    // payload.append(&mut nonce.encode());
    // payload.append(&mut mrenclave.encode());
    // payload.append(&mut shard.encode());
    // NOTE: For now, MRENCLAVE==SHARD
    let payload = new Uint8Array([call.toU8a(), nonce.toU8a(), mrenclave_codec_type.toU8a(), mrenclave_codec_type.toU8a()]);
    let signature = self.createType('Signature', accountOrPubKey.sign(payload));
    console.log("Signature: ", signature.toHex())
    return self.createType('TrustedCallSigned', {
        call: call,
        nonce: nonce,
        signature: signature
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
    let shard = self.createType("ShardIdentifier", bs58.decode(mrenclave));
    let encoded_txt = self.createType("Vec<u8>", trustedOperation.toHex());
    return self.createType("DirectRequest", [shard, encoded_txt])
}