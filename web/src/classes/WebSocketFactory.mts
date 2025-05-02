import WebSocketClient, {IWebSocketClientMessageCallback, IWebSocketClientOptions} from '../../../lib/SharedUtils/WebSocketClient.mts'
import UrlUtils from './UrlUtils.mts'
import Log from '../../../lib/SharedUtils/Log.mts'

export default class WebSocketFactory {
    getDatabaseClient(textCallback: IWebSocketClientTextCallback, statusCallback: IWebSocketClientStatusCallback): DatabaseWebSocketClient {
        return this.buildClient('db', 'future-password', textCallback, statusCallback)
    }
    getPresenterClient(textCallback: IWebSocketClientTextCallback, statusCallback: IWebSocketClientStatusCallback): PresenterWebSocketClient {
        return this.buildClient('presenter', 'future-password', textCallback, statusCallback)
    }

    private buildClient(subprotocol: string, password: string, textCallback: IWebSocketClientTextCallback, statusCallback: IWebSocketClientStatusCallback): WebSocketClient {
        const urlParams = UrlUtils.getParams()
        const host = urlParams.get('host') ?? '127.0.0.1'
        const port = urlParams.get('port') ?? '7712'
        const id = urlParams.get('id') ?? '0'
        const TAG = `${WebSocketClient.name}-${host}:${port}`
        const subprotocols = [subprotocol, password]
        subprotocols.push(id)

        const wsOptions: IWebSocketClientOptions = {
            clientName: 'Presenter',
            serverUrl: `ws://${host}:${port}`,
            messageQueueing: true,
            onOpen: (openEvent)=>{
                Log.i(TAG, `Connected to ws://${host}:${port}`, openEvent)
                statusCallback(true)
            },
            onClose: (closeEvent)=>{
                Log.i(TAG, `Disconnected from ws://${host}:${port}`, closeEvent)
                statusCallback(false)
            },
            onMessage: (messageEvent)=>{
                textCallback(messageEvent.data)
            },
            onError: (errorEvent)=>{
                Log.w(TAG, 'Received error!', errorEvent)
            },
            subprotocolValues: subprotocols
        }
        return new WebSocketClient(wsOptions)
    }
}

export class DatabaseWebSocketClient {
    
}

export class PresenterWebSocketClient {

}

export interface IWebSocketClientTextCallback {

}
export interface IWebSocketClientStatusCallback {
    (evt: boolean): void
}