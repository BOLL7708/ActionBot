import WebSocketClient, {IWebSocketClientMessageCallback, IWebSocketClientOptions} from '../../../lib/SharedUtils/WebSocketClient.mts'
import UrlUtils from './UrlUtils.mts'
import Log from '../../../lib/SharedUtils/Log.mts'

export default class WebSocketFactory {
    static getDatabaseClient(callback: IWebSocketClientMessageCallback): WebSocketClient {
        const urlParams = UrlUtils.getParams()
        const host = urlParams.get('host') ?? '127.0.0.1'
        const port = urlParams.get('port') ?? '7712'
        const id = urlParams.get('id') ?? '0'
        const TAG = `${WebSocketClient.name}-${host}:${port}`

        const wsOptions: IWebSocketClientOptions = {
            clientName: 'Presenter',
            serverUrl: `ws://${host}:${port}`,
            messageQueueing: true,
            onOpen: (openEvent)=>{
                Log.i(TAG, `Connected to ws://${host}:${port}`, openEvent)
            },
            onClose: (closeEvent)=>{
                Log.i(TAG, `Disconnected from ws://${host}:${port}`, closeEvent)
            },
            onMessage: callback,
            onError: (errorEvent)=>{
                Log.w(TAG, 'Received error!', errorEvent)
            },
            subprotocolValues: ['db', 'future-password', id]
        }
        return new WebSocketClient(wsOptions)
    }
    static getPresenterClient(callback: IWebSocketClientMessageCallback): WebSocketClient {
        const urlParams = UrlUtils.getParams()
        const host = urlParams.get('host') ?? '127.0.0.1'
        const port = urlParams.get('port') ?? '7712'
        const id = urlParams.get('id') ?? '0'
        const TAG = `${WebSocketClient.name}-${host}:${port}`

        const wsOptions: IWebSocketClientOptions = {
            clientName: 'Presenter',
            serverUrl: `ws://${host}:${port}`,
            messageQueueing: true,
            onOpen: (openEvent)=>{
                Log.i(TAG, `Connected to ws://${host}:${port}`, openEvent)
            },
            onClose: (closeEvent)=>{
                Log.i(TAG, `Disconnected from ws://${host}:${port}`, closeEvent)
            },
            onMessage: callback,
            onError: (errorEvent)=>{
                Log.w(TAG, 'Received error!', errorEvent)
            },
            subprotocolValues: ['presenter', 'future-password', id]
        }
        return new WebSocketClient(wsOptions)
    }

}