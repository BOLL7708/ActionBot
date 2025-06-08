import SystemMessage from '../../../lib/Types/WebSocket/SystemMessage.ts'
import ErrorCodes from '../../Constants/ErrorCodes.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export interface ISystemHandlerMessage {
    action: string
}

export default class SystemHandler extends AbstractWebSocketHandler {
    private readonly TAG = this.constructor.name

    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const message = new SystemMessage().__apply(messageStr)
        if (message.action === 'ping') {
            server.sendMessage(
                JSON.stringify({action: 'pong'}),
                session.sessionId,
                [session.subprotocols[0]]
            )
        } else {
            server.disconnectSession(session.sessionId, ErrorCodes.INVALID_AUTH_PING, 'Invalid ping')
        }
    }
}