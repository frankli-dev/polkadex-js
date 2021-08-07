import {PolkadexWorker} from '../../src/api';
import {MarketId, Order, OrderSide, OrderType, PlaceOrderArgs, UserId} from '../../src/types/interfaces';
import {Keyring} from '@polkadot/api';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {localNetwork} from './localNetwork';
import WS from 'websocket';
const {w3cwebsocket: WebSocket} = WS;

import * as mocha from 'mocha';
import * as chai from 'chai';

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
        const user_id = worker.createType('UserId', alice.publicKey);
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

        const trustedcallsigned = worker.trustedCallPlaceOrder(alice, network.mrenclave, nonce, place_order_params);
        const trustedOperation = worker.trustedOperationDirectCall(trustedcallsigned);
        const direct_request = worker.createRequest(trustedOperation,network.mrenclave);
        const expected_encoded_call = new Uint8Array([65,61,211,138,32,161,21,135,119,9,73,45,139,62,46,163,53,200,61,38,155,91,91,249,210,145,60,178,179,171,71,193,213,2,1,4,212,53,147,199,21,253,211,28,97,20,26,189,4,169,159,214,130,44,133,88,133,76,205,227,154,86,132,231,165,109,162,125,212,53,147,199,21,253,211,28,97,20,26,189,4,169,159,214,130,44,133,88,133,76,205,227,154,86,132,231,165,109,162,125,0,0,28,116,114,117,115,116,101,100,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,120,61,163,255,194,38,91,69,123,16,190,11,240,147,111,70,205,66,34,95,199,99,45,111,37,160,237,229,214,39,149,48,7,158,100,46,105,155,195,17,5,69,45,205,87,40,174,62,216,55,110,125,205,41,96,58,108,130,144,120,6,120,64,138]);
        // the last 64 bytes are from the non-deterministic signature
        expect(direct_request.toHex()).to.equal(toHexString(expected_encoded_call));
    });

});

function toHexString(byteArray) {
    return '0x'+ Array.from(byteArray, function(byte) {
        // @ts-ignore
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}