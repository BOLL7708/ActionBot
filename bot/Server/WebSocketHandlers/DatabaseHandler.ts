import {IJsonStore} from '../../../lib/index.ts'
import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'
import JsonStore from '../../Database/JsonStore.ts'
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
                let data: IJsonStore[]|undefined = []
                if(request.groupClass) {
                    if(request.groupKey) {
                        data = JsonStore.loadByGroupAndKey(request.groupClass,request.groupKey)
                    } else {
                        data = [] // JsonStoreHelper.loadJsonByGroup(request.groupClass) // TODO: Implement when needed.
                    }
                } else if(request.rowId) {
                    data = JsonStore.loadByRowId(request.rowId, request.parentId)
                }
                Log.i(this.TAG, 'DatabaseMessage', {data})
                if(data) {
                    const response = new DatabaseResponse()
                    response.messageId = request.messageId
                    response.items = data
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