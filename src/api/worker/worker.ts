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
import {Order} from "../../types/interfaces";
import {IPolkadexWorker, WorkerOptions} from "./interface";
import {createDirectRequest, createTrustedCall, createTrustedOperation, TrustedCallArgs} from "./trustedCallApi";
import {Key} from "@polkadot/types/interfaces/system";

const parseOrderbookResponse = (self: IPolkadexWorker, data: string): RpcReturnValue => {
    let result = self.createType('RpcReturnValue', hexToU8a("0x" + toHexString(JSON.parse(data).result)));
    console.log("Result (decoded): ", JSON.parse(result.toString()))
    if (JSON.parse(result.toString())["status"]["Error"] == null) {
        console.log("Error: ", uintToString(self.createType('Vec<u8>', JSON.parse(result.toString())["value"]).toU8a()))
    }
    return result
}


export class PolkadexWorker extends WebSocketAsPromised implements IPolkadexWorker {
    readonly #registry: TypeRegistry;

    #keyring?: Keyring;

    rqStack: string[];
    rsCount: number;
    mrenclave: string;
    // This is hardcoded constant for now
    market_type: [116, 114, 117, 115, 116, 101, 100];

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
        this.mrenclave = "";
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

    public setMRENCLAVE(mrenclave: string): void {
        this.mrenclave = mrenclave
    }

    // Creates the required types and place the order to orderbook and returns the result
    public async placeOrder(account: KeyringPair, nonce: number, baseAsset: string, quoteAsset: string, ordertype: string, orderSide: string, Price: number, Quantity: number) {
        const user_id = this.createType('UserId', account.address);
        const base = this.createType("AssetId", baseAsset);
        const quote = this.createType("AssetId", quoteAsset);
        const market_id = this.createType('MarketId', [base, quote]);
        const market_type = this.createType('Bytes', this.market_type);
        const order_type = this.createType('OrderType', ordertype);
        const side = this.createType('OrderSide', orderSide);
        const quantity = this.createType('u128', Quantity);
        const price = this.createType('Option<u128>', Price);
        const order: Order = this.createType('Order', [user_id, market_id, market_type, order_type, side, quantity, price]);
        const nonce_type = this.createType('u32', nonce);
        const place_order_params = this.createType('PlaceOrderArgs', [account.address, order, account.address]);
        let trustedOperation = this.trustedOperationDirectCall(this.trustedCallPlaceOrder(account, this.mrenclave, nonce_type, place_order_params));
        let rpc_call = this.composeJSONRpcCall("place_order", this.createdirectRequest(trustedOperation, this.mrenclave));
        if (!this.isOpened) {
            await this.open()
        }
        return await this.sendRequest(rpc_call)
    }

    public trustedCallPlaceOrder(accountOrPubKey: KeyringPair, mrenclave: string, nonce: u32, params: TrustedCallArgs): TrustedCallSigned {
        return createTrustedCall(this, ['place_order', 'PlaceOrderArgs'], accountOrPubKey, mrenclave, nonce, params)
    }

    // Creates the required types and cancels the order in orderbook and returns the result
    public async cancelOrder(account: KeyringPair, nonce: number, baseAsset: string, quoteAsset: string, order_uuid: Uint8Array) {
        const user_id = this.createType('UserId', account.address);
        const base = this.createType("AssetId", baseAsset);
        const quote = this.createType("AssetId", quoteAsset);
        const market_id = this.createType('MarketId', [base, quote]);
        const order_uuid_type = this.createType('Vec<u8>', Array.from(order_uuid));
        const cancelled_order = this.createType('CancelOrder', [user_id, market_id, order_uuid_type]);
        const nonce_type = this.createType('u32', nonce);
        const cancel_order_params = this.createType('CancelOrderArgs', [account.address, cancelled_order, account.address]);
        let trustedOperation = this.trustedOperationDirectCall(createTrustedCall(this, ['cancel_order', 'CancelOrderArgs'], account, this.mrenclave, nonce_type, cancel_order_params));
        let rpc_call = this.composeJSONRpcCall("place_order", this.createdirectRequest(trustedOperation, this.mrenclave));
        if (!this.isOpened) {
            await this.open()
        }
        return await this.sendRequest(rpc_call)
    }

    public trustedCallCancelOrder(accountOrPubKey: KeyringPair, mrenclave: string, nonce: u32, params: TrustedCallArgs): TrustedCallSigned {
        return createTrustedCall(this, ['cancel_order', 'CancelOrderArgs'], accountOrPubKey, mrenclave, nonce, params)
    }

    public async withdraw(account: KeyringPair, nonce: number, assetId: string, quantity: number) {
        const asset_id = this.createType("AssetId", assetId);
        const Quantity = this.createType('u128', quantity);
        const nonce_type = this.createType('u32', nonce);
        const withdraw_params = this.createType('CancelOrderArgs', [account.address, asset_id, Quantity, account.address]);
        let trustedOperation = this.trustedOperationDirectCall(createTrustedCall(this, ['withdraw', 'WithdrawArgs'], account, this.mrenclave, nonce_type, withdraw_params));
        let rpc_call = this.composeJSONRpcCall("place_order", this.createdirectRequest(trustedOperation, this.mrenclave));
        if (!this.isOpened) {
            await this.open()
        }
        return await this.sendRequest(rpc_call)
    }

    // Helper functions
    public trustedOperationDirectCall(trustedCallSigned: TrustedCallSigned): TrustedOperation {
        return createTrustedOperation(this, ['direct_call', 'TrustedCallSigned'], trustedCallSigned)
    }

    public createdirectRequest(trustedOperation: TrustedOperation, mrenclave: string): DirectRequest {
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
    return Array.from(byteArray, function (byte) {
        // @ts-ignore
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

function uintToString(uintArray) {
    return new TextDecoder().decode(uintArray)
}