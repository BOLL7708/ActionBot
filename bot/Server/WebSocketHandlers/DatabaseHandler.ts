import Log from '../../../lib/SharedUtils/Log.ts'
import {IDatabaseMessage} from '../../../lib/index.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketServer, { IWebSocketServerSession } from '../../DenoUtils/WebSocketServer.ts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export default class DatabaseHandler extends AbstractWebSocketHandler {
    private readonly TAG = this.constructor.name
    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const message = ValueUtils.safeJsonParse<IDatabaseMessage>(messageStr)
        Log.w(this.TAG, 'Received DB message', {message, session})
        // const dbMessage = JSON.parse(message) as IDatabaseMessage | undefined
        if(message) {
            const data = DatabaseHelper.loadJson(message.group, message.key, message.parentId, message.id)
            // TODO: Change this to a common format that includes a nonce value in the output
            server.sendMessage(JSON.stringify(data), session.sessionId, session.subprotocols)
        } else {
            Log.e(this.TAG, 'Failed to parse incoming DB message', {message, session})
        }
    }
}