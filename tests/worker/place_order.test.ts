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

        console.log("trustedcallsigned",trustedcallsigned.toHex().slice(0,-128));
        // TODO: Convert to hex and check against a known hex
        // the last 64 bytes are from the non-deterministic signature
        // expect(add(3,4)).to.equal(7);
    });

});