import {Keyring} from '@polkadot/keyring'
import {hexToU8a, u8aToHex} from '@polkadot/util';
import type {u32} from '@polkadot/types';
import {TypeRegistry} from '@polkadot/types';
import {RegistryTypes} from '@polkadot/types/types';
import WebSocketAsPromised from 'websocket-as-promised';
import type {KeyringPair} from '@polkadot/keyring/types';
import type {DirectRequest, PlaceOrderArgs, TrustedCallSigned, TrustedOperation} from '../../types/interfaces';
import {IPolkadexWorker, WorkerOptions} from "./interface";
import {createDirectRequest, createTrustedCall, createTrustedOperation, TrustedCallArgs} from "./trustedCallApi";

const unwrapWorkerResponse = (self: IPolkadexWorker, data: string) => {
    /// Unwraps the value that is wrapped in all the Options and encoding from the worker.
    /// Defaults to return `[]`, which is fine as `createType(api.registry, <type>, [])`
    /// instantiates the <type> with its default value.
    const dataTyped = self.createType('Option<WorkerEncoded>', hexToU8a('0x'.concat(data)))
        .unwrapOrDefault(); // (Option<Value.enc>.enc+whitespacePad)
    const trimmed = u8aToHex(dataTyped).replace(/(20)+$/, '');
    return self.createType('Option<WorkerEncoded>', hexToU8a(trimmed))
        .unwrapOrDefault()
}

const noOp = (data: any) => {
    return data
}

const parseOrderbookResponse = (self: IPolkadexWorker, data: string) => {
    return self.createType('RpcReturnValue', JSON.parse(data).result)
}

export class PolkadexWorker extends WebSocketAsPromised implements IPolkadexWorker {
    readonly #registry: TypeRegistry;

    #keyring?: Keyring;

    rqStack: string[];
    rsCount: number;

    constructor(url: string, options: WorkerOptions = {} as WorkerOptions) {
        super(url, {
            createWebSocket: (options.createWebSocket || undefined),
            packMessage: (data: any) => noOp(data),
            unpackMessage: (data: any) => parseOrderbookResponse(this, data),
            attachRequestId: (data: any, requestId: string | number): any => data,
            extractRequestId: (data: any) => this.rsCount = ++this.rsCount
        });
        const {api, types} = options;
        this.#keyring = (options.keyring || undefined);
        this.#registry = new TypeRegistry();
        this.rsCount = 0;
        this.rqStack = [] as string[]
        // if (api) {
        //     this.#registry = api.registry;
        // }
        if (types) {
            this.#registry.register(options.types as RegistryTypes);
        }
    }

    public createType(apiType: string, obj?: any): any {
        return this.#registry.createType(apiType as never, obj)
    }

    public keyring(): Keyring {
        return this.#keyring;
    }

    public setKeyring(keyring: Keyring): void {
        this.#keyring = keyring;
    }

    public trustedCallPlaceOrder(accountOrPubKey: KeyringPair, mrenclave: string, nonce: u32, params: TrustedCallArgs): TrustedCallSigned {
        return createTrustedCall(this, ['place_order', 'PlaceOrderArgs'], accountOrPubKey, mrenclave, nonce, params)
    }

    public trustedOperationDirectCall(trustedCallSigned: TrustedCallSigned): TrustedOperation {
        return createTrustedOperation(this, ['direct_call', 'TrustedCallSigned'], trustedCallSigned)
    }

    public createRequest(trustedOperation: TrustedOperation, mrenclave: string): DirectRequest {
        return createDirectRequest(this, trustedOperation, mrenclave)
    }

    public composeJSONRpcCall(method: string, data: DirectRequest): string {
        return JSON.stringify({
            jsonrpc: "2.0",
            method,
            params: Array.from(data.toU8a()),
            id: 1
        })
    }

}