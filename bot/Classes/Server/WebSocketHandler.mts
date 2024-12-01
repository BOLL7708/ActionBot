import {ConfigServer} from '../../../lib/Objects/Data/Config/ConfigServer.mts'
import Log from '../../EasyTSUtils/Log.mts'
import WebSocketServer, {IWebSocketServerSession} from '../../EasyTSUtils/WebSocketServer.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'

/**
 * Handles all websocket communication
 *
 * Database communication will all be on demand, let the editor have a reload button to load fresh data from DB.
 *
 * Presenter should have a pipe out, so we can send things to present, kind of the point of it.
 */
export default class WebSocketHandler {
    private readonly TAG = this.constructor.name
    private _server: WebSocketServer

    constructor() {
        const config = DatabaseHelper.loadMain(new ConfigServer())
        this._server = new WebSocketServer({
            name: 'Test',
            port: config.webSocketServerPort,
            keepAlive: true,
            onMessageReceived: (message, session) => {
                switch (session.subProtocols[0]) {
                    case 'db':
                        this.handleDb(message, session)
                        break
                    case 'presenter':
                        this.handlePresenter(message, session)
                        break
                    // TODO: Add things like Stream Deck support
                    default:
                        this.handleUnknown(message, session)
                        break
                }
            },
            onServerEvent: (state, value, session) => {
                Log.i(this.TAG, state.toString(), value, session)
            }
        })
    }

    private handleUnknown(message: string, session: IWebSocketServerSession) {
        Log.w(this.TAG, 'Unhandled WebSocket message', message, session)
    }

    private handleDb(message: string, session: IWebSocketServerSession) {
        // TODO: Handle authentication here, check second sub-protocol value.
        try {
            const dbMessage = JSON.parse(message) as IDbMessage | undefined
            const data = DatabaseHelper.loadJson(dbMessage?.group, dbMessage?.key, dbMessage?.parentId, dbMessage?.id)
            // TODO: Change this to a common format that includes a nonce value in the output
            this._server.sendMessage(JSON.stringify(data), session.sessionId, session.subProtocols[0])
        } catch (e) {
            Log.e(this.TAG, 'Failed to parse incoming DB message', {message, session})
        }
    }

    private handlePresenter(message: string, session: IWebSocketServerSession) {
        // TODO: Implement the presenter.
    }

    sendToPresenter(message: string, session: IWebSocketServerSession) {
        // TODO: Send things to show in the presenter.
    }
}

export interface IDbMessage {
    id?: number
    key?: string
    group?: string
    parentId?: number
    // TODO: Add support here for more advanced stuff, OR, to not repeat the PHP coms make it different types of messages.
}