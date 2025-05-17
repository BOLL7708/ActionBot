import {ConfigServer} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import WebSocketServer, {IWebSocketServerSession} from '../DenoUtils/WebSocketServer.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'
import DatabaseHandler from './WebSocketHandlers/DatabaseHandler.mts'

/**
 * Handles all websocket communication
 *
 * Database communication will all be on demand, let the editor have a reload button to load fresh data from DB.
 *
 * Presenter should have a pipe out, so we can send things to present, kind of the point of it.
 */
export default class WebSocketHandler {
    private readonly TAG = this.constructor.name
    private readonly _server: WebSocketServer

    constructor() {
        const config = DatabaseHelper.loadMain(new ConfigServer())
        this._server = new WebSocketServer({
            name: 'Central Server',
            port: config.webSocketPort,
            hostname: config.hostname,
            keepAlive: true,
            onMessageReceived: (message, session) => {
                switch (session.subprotocols[0]) {
                    case 'db': {
                        const handler = new DatabaseHandler()
                        handler.handle(this._server, message, session)
                        break
                    }
                    case 'presenter':
                        // TODO: Switch to handler class
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
            },
            loggingProxy: Log.get()
        })
    }

    private handleUnknown(message: string, session: IWebSocketServerSession) {
        Log.w(this.TAG, 'Unhandled WebSocket message', message, session)
    }

    private handlePresenter(message: string, session: IWebSocketServerSession) {
        // TODO: Implement the presenter.
    }

    send(message: string, subprotocolValues: string[]) {
        this._server.sendMessageToAll(message, subprotocolValues)
    }
}