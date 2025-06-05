import {ConfigAuth, ConfigServer, TWebSocketSubprotocol} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import WebSocketServer, {EWebSocketServerState, IWebSocketServerSession} from '../DenoUtils/WebSocketServer.mts'
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
            hostname: '0.0.0.0', // Any host and interface
            keepAlive: true,
            onMessageReceived: (messageJson, session) => {
                const [protocol, password] = session.subprotocols
                const auth = DatabaseHelper.loadMain(new ConfigAuth())
                if (password !== auth.passwordHash) {
                    this._server.sendMessage(
                        'Password mismatch',
                        session.sessionId,
                        [protocol]
                    )
                    this._server.disconnectSession(session.sessionId)
                }

                let message: any
                try {
                    message = JSON.parse(messageJson)
                } catch (ex) {
                    Log.e(this.TAG, 'Unable to parse message', messageJson, ex)
                    return
                }
                switch (protocol as TWebSocketSubprotocol) {
                    case 'authentication': {
                        if (message.action === 'ping') {
                            this._server.sendMessage(
                                JSON.stringify({action: 'pong'}),
                                session.sessionId,
                                [protocol]
                            )
                        } else {
                            this._server.disconnectSession(session.sessionId, 1234, 'Ping better you fool!')
                        }
                        break
                    }
                    case 'database': {
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
                if (session && state === EWebSocketServerState.ClientConnected) {
                    const [_protocol, password] = session.subprotocols
                    const auth = DatabaseHelper.loadMain(new ConfigAuth())
                    if (password === auth.passwordHash) {
                        this._server.sendMessage(
                            JSON.stringify(
                                {message: 'You are connected to ActionBot!'}
                            ), session.sessionId
                        )
                    } else {
                        this._server.sendMessage(
                            JSON.stringify(
                                {error: 'Password mismatch'}
                            ),
                            session.sessionId
                        )
                        this._server.disconnectSession(session.sessionId)
                    }
                }
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

    async stop() {
        await this._server.shutdown()
    }
}