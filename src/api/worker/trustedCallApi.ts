import {KeyringPair} from "@polkadot/keyring/types";
import {u32} from "@polkadot/types";
import {CancelOrderArgs, PlaceOrderArgs, TrustedCallSigned, WithdrawArgs} from "../../types/interfaces";
import {IPolkadexWorker} from "./interface";
import bs58 from "bs58";

export type TrustedCallArgs = (PlaceOrderArgs | CancelOrderArgs | WithdrawArgs);

export type TrustedCallVariant = [string, string]

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

    const payload = Uint8Array.from([...call.toU8a(), ...nonce.toU8a()]);

    return self.createType('TrustedCallSigned', {
        call: call,
        nonce: nonce,
        signature: accountOrPubKey.sign(payload)
    });
}