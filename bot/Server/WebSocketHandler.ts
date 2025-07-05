import {ConfigAuth, ConfigServer, TWebSocketSubprotocol} from '../../lib/index.ts'
import StatusCodes from '../../lib/SharedConstants/StatusCodes.ts'
import Log from '../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import WebSocketServer, {EWebSocketServerState, IWebSocketServerSession} from '../DenoUtils/WebSocketServer.ts'
import ItemStore from '../Database/ItemStore.ts'
import SystemHandler from './WebSocketHandlers/SystemHandler.ts'
import DatabaseHandler from './WebSocketHandlers/DatabaseHandler.ts'

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
        const config = ItemStore.do.loadMain(ConfigServer)
        this._server = new WebSocketServer({
            name: 'Central Server',
            port: config.webSocketPort,
            hostname: '0.0.0.0', // Any host and interface
            keepAlive: true,
            onMessageReceived: (messageStr, session) => {
                const [protocol, passwordHash] = session.subprotocols
                const auth = ItemStore.do.loadMain(ConfigAuth)
                if (passwordHash !== auth.passwordHash) {
                    this._server.sendMessage(
                        'Password mismatch',
                        session.sessionId,
                        [protocol]
                    )
                    this._server.disconnectSession(session.sessionId, StatusCodes.WebSocketBadPassword)
                }
                switch (protocol as TWebSocketSubprotocol) {
                    case 'system': {
                        const handler = new SystemHandler()
                        handler.handle(this._server, messageStr, session)
                        break
                    }
                    case 'database': {
                        const handler = new DatabaseHandler()
                        handler.handle(this._server, messageStr, session)
                        break
                    }
                    case 'presenter':
                        // TODO: Switch to handler class
                        this.handlePresenter(messageStr, session)
                        break
                    // TODO: Add things like Stream Deck support
                    default:
                        this.handleUnknown(messageStr, session)
                        break
                }
            },
            onServerEvent: (state, value, session) => {
                if (session && state === EWebSocketServerState.ClientConnected) {
                    const [_protocol, passwordHash] = session.subprotocols
                    const auth = ItemStore.do.loadMain(ConfigAuth)
                    if (passwordHash !== auth.passwordHash) {
                        this._server.disconnectSession(session.sessionId, StatusCodes.WebSocketBadPassword)
                    }
                }
                Log.i(this.TAG, state.toString(), value, session?.sessionId)
            },
            loggingProxy: Log.get()
        })
    }

    private handleUnknown(messageStr: string, session: IWebSocketServerSession) {
        Log.w(this.TAG, 'Unhandled WebSocket message', messageStr, session)
    }

    private handlePresenter(messageStr: string, session: IWebSocketServerSession) {
        // TODO: Implement the presenter.
    }

    send(message: string, subprotocolValues: string[]) {
        this._server.sendMessageToAll(message, subprotocolValues)
    }

    async stop() {
        await this._server.shutdown()
    }
}