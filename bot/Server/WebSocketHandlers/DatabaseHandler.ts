import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export default class DatabaseHandler extends AbstractWebSocketHandler {
    private readonly TAG = this.constructor.name
    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const request = new DatabaseRequest().__apply(messageStr)
        Log.d(this.TAG, 'Received DB message', {message: request, session})
        switch(request.action) {
            case 'unknown':
                Log.w(this.TAG, 'Received unknown action', {message: request, session})
                break
            case 'load': {
                const data = DatabaseHelper.loadJson(
                    ValueUtils.nullIfBlank(request.groupClass),
                    ValueUtils.nullIfBlank(request.groupKey),
                    ValueUtils.nullIfBlank(request.parentId),
                    ValueUtils.nullIfBlank(request.rowId)
                )
                Log.i(this.TAG, 'DatabaseMessage', {data})
                if(data) {
                    const response = new DatabaseResponse()
                    response.messageId = request.messageId
                    response.dataJsonBase64 = ValueUtils.safeBase64Encode(JSON.stringify(data)) ?? ''
                    server.sendMessage(JSON.stringify(response), session.sessionId, [session.subprotocols[0]])
                } else {
                    Log.e(this.TAG, 'Failed to parse incoming DB message', {messageStr, session})
                }
                break
            }
            case 'save': {
                // TODO: Implement
                break
            }
            case 'delete': {
                // TODO: Implement
                break
            }
        }
    }
}