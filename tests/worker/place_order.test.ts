import {PolkadexWorker} from '../../src/api';
import {MarketId, Order, OrderSide, OrderType, PlaceOrderArgs, UserId} from '../../src/types/interfaces';
import {Keyring} from '@polkadot/api';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {localNetwork} from './localNetwork';
import WS from 'websocket';
import {PlaceOrderTestValues} from "./test_values";
import bs58 from "bs58";
const {w3cwebsocket: WebSocket} = WS;

import * as mocha from 'mocha';
import * as chai from 'chai';
import {createTrustedCall} from "../../src/api/worker/trustedCallApi";

const expect = chai.expect;
describe('Worker Tests', async () => {
    let network = localNetwork();
    console.log("Initializing Keyring...(It takes a min)");
    await cryptoWaitReady();
    console.log("Keyring Ready!");

    it('Place Order Encoding Test', async () => {
        let keyring = new Keyring({type: 'sr25519'});
        let worker = new PolkadexWorker(network.worker, {
            // api: undefined,
            keyring: keyring,
            types: network.types,
            // @ts-ignore
            createWebSocket: (url) => new WebSocket(url)
        });
        // Data required for creating a place order call
        const alice = keyring.addFromUri('//Alice');
        const user_id = worker.createType('UserId', alice.address);
        const base = worker.createType("AssetId", "DOT");
        const quote = worker.createType("AssetId", "POLKADEX");
        const market_id = worker.createType('MarketId', [base, quote]);
        const market_type = worker.createType('Bytes', [116, 114, 117, 115, 116, 101, 100]);
        const order_type = worker.createType('OrderType', "LIMIT");
        const side = worker.createType('OrderSide', "BID");
        const quantity = worker.createType('u128', 1);
        const price = worker.createType('Option<u128>', 100);
        const order: Order = worker.createType('Order', [user_id, market_id, market_type, order_type, side, quantity, price]);
        const nonce = worker.createType('u32', 0);
        const place_order_params = worker.createType('PlaceOrderArgs', [alice.address, order, alice.address]);

        const trustedCall = worker.createType('TrustedCall', {['place_order']: worker.createType('PlaceOrderArgs', place_order_params)});
        expect(trustedCall.toHex()).to.equal(PlaceOrderTestValues().trustedCall);

        // the last 64 bytes are from the non-deterministic signature, so we are trimming that.
        const trustedcallsigned = worker.trustedCallPlaceOrder(alice, network.mrenclave, nonce, place_order_params);
        expect(trustedcallsigned.toHex().slice(0, -128)).to.equal(PlaceOrderTestValues().trustedCallSigned);

        const trustedOperation = worker.trustedOperationDirectCall(trustedcallsigned);
        expect(trustedOperation.toHex().slice(0, -128)).to.equal(PlaceOrderTestValues().trustedOperation);

        const direct_request = worker.createdirectRequest(trustedOperation, network.mrenclave);

        const shard = worker.createType('ShardIdentifier',bs58.decode(network.mrenclave));
        const encoded_txt = worker.createType('Vec<u8>',[0,1,2,3]);
        const sample = worker.createType('DirectRequest',[shard, encoded_txt]);
        console.log("Sample Encoded: ",sample.toHex())

        // TODO: There one character difference with test value from rust code, resulting in unit test failure
        expect(direct_request.toHex().slice(0, -128)).to.equal(PlaceOrderTestValues().direct_request);

        const rpc_request = worker.composeJSONRpcCall("place_order",direct_request);
        console.log("Opening WS...");
        await worker.open()
        console.log("Opened WS");
        worker.sendRequest(rpc_request).then(result => {
            worker.close()
            console.log("Result: ",result)
        });
    });

});