import {Keyring} from '@polkadot/keyring'
import {hexToU8a} from '@polkadot/util';
import type {u32} from '@polkadot/types';
import {TypeRegistry} from '@polkadot/types';
import {RegistryTypes} from '@polkadot/types/types';
import WebSocketAsPromised from 'websocket-as-promised';
import type {KeyringPair} from '@polkadot/keyring/types';
import type {
    DirectRequest,
    PlaceOrderArgs,
    RpcReturnValue,
    TrustedCallSigned,
    TrustedOperation
} from '../../types/interfaces';
import {IPolkadexWorker, WorkerOptions} from "./interface";
import {createDirectRequest, createTrustedCall, createTrustedOperation, TrustedCallArgs} from "./trustedCallApi";

const parseOrderbookResponse = (self: IPolkadexWorker, data: string): RpcReturnValue => {
    let result = self.createType('RpcReturnValue', hexToU8a("0x"+toHexString(JSON.parse(data).result)));
    console.log("Result (decoded): ",JSON.parse(result.toString()))
    if(JSON.parse(result.toString())["status"]["Error"] == null){
        console.log("Error: ",uintToString(self.createType('Vec<u8>',JSON.parse(result.toString())["value"]).toU8a()))
    }
    return result
}

export class PolkadexWorker extends WebSocketAsPromised implements IPolkadexWorker {
    readonly #registry: TypeRegistry;

    #keyring?: Keyring;

    rqStack: string[];
    rsCount: number;

    constructor(url: string, options: WorkerOptions = {} as WorkerOptions) {
        super(url, {
            createWebSocket: (options.createWebSocket || undefined),
            packMessage: (data: any) => data,
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

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        // @ts-ignore
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

function uintToString(uintArray) {
    return new TextDecoder().decode(uintArray)
}