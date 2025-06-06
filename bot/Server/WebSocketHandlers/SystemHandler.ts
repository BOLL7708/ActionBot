import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import SystemMessage from '../../../lib/Types/WebSocket/SystemMessage.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.mts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.mts'

export interface ISystemHandlerMessage {
    action: string
}

export default class SystemHandler extends AbstractWebSocketHandler {
    private readonly TAG = this.constructor.name

    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const message = ValueUtils.safeJsonParse<ISystemHandlerMessage>(messageStr)
        if (message?.action === 'ping') {
            server.sendMessage(
                JSON.stringify({action: 'pong'}),
                session.sessionId,
                [session.subprotocols[0]]
            )
        } else {
            server.disconnectSession(session.sessionId, 1234, 'Invalid ping')
        }
    }
}