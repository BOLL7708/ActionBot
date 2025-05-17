import Log from '../../../lib/SharedUtils/Log.mts'
import {IDatabaseMessage} from '../../../lib/index.mts'
import WebSocketServer, { IWebSocketServerSession } from '../../DenoUtils/WebSocketServer.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import AbstractWebsocketHandler from './AbstractWebsocketHandler.mts'

export default class DatabaseHandler extends AbstractWebsocketHandler {
    private readonly TAG = this.constructor.name
    override handle(server: WebSocketServer, message: string, session: IWebSocketServerSession): void {
        // TODO: Handle authentication here, check second sub-protocol value.
        try {
            const dbMessage = JSON.parse(message) as IDatabaseMessage | undefined
            const data = DatabaseHelper.loadJson(dbMessage?.group, dbMessage?.key, dbMessage?.parentId, dbMessage?.id)
            // TODO: Change this to a common format that includes a nonce value in the output
            server.sendMessage(JSON.stringify(data), session.sessionId, session.subprotocols)
        } catch (e) {
            Log.e(this.TAG, 'Failed to parse incoming DB message', {message, session})
        }
    }
}