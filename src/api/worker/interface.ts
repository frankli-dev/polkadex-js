import WebSocketAsPromised from 'websocket-as-promised';
import {Keyring} from "@polkadot/keyring";

export interface IPolkadexWorker extends WebSocketAsPromised {
    rsCount: number;
    rqStack: string[];
    mrenclave: string;
    keyring: () => Keyring;
    createType: (apiType: string, obj?: any) => any;
    open: () => Promise<Event>;
}

export interface WorkerOptions {
    keyring?: Keyring;
    api: any;
    types: any;
    createWebSocket?: (url: string) => WebSocket;
}