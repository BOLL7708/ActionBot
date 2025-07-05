import {IJsonStore} from '../../../lib/index.ts'
import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'
import JsonStore from '../../Database/JsonStore.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export default class DatabaseHandler extends AbstractWebSocketHandler {
    readonly #tag = this.constructor.name
    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const request = new DatabaseRequest().__apply(messageStr)
        Log.d(this.#tag, 'Received DB message', {message: request, session})
        switch(request.action) {
            case 'unknown':
                Log.w(this.#tag, 'Received unknown action', {message: request, session})
                break
            case 'load': {
                // Load from database
                let data: IJsonStore[]|undefined = []
                if(request.groupClass) {
                    if(request.groupKey) {
                        data = JsonStore.loadByGroupAndKey(request.groupClass,request.groupKey)
                    } else {
                        data = []
                    }
                } else if(request.rowId) {
                    data = JsonStore.loadByRowId(request.rowId, request.parentId)
                }
                Log.i(this.#tag, 'DatabaseMessage', {data})

                // Build response
                if(data) {
                    const response = new DatabaseResponse()
                    response.messageId = request.messageId
                    response.items = data
                    server.sendMessage(JSON.stringify(response), session.sessionId, [session.subprotocols[0]])
                } else {
                    Log.e(this.#tag, 'Failed to parse incoming DB Load message', {messageStr, session})
                }
                break
            }
            case 'save': {
                let id = -1
                if(request.groupClass && (request.groupKey || request.parentId)) {
                    id = JsonStore.save({
                        group_class: request.groupClass,
                        group_key: request.groupKey ?? null,
                        parent_id: request.parentId ?? null,
                        json_text: JSON.stringify(request.data)
                    })
                } else {
                    Log.e(this.#tag, 'Failed to parse incoming DB Save message', {messageStr, session})
                }
                const response = new DatabaseResponse()
                response.messageId = request.messageId
                response.savedRowId = id
                server.sendMessage(JSON.stringify(response), session.sessionId, [session.subprotocols[0]])
                break
            }
            case 'delete': {
                let deleteCount = -1
                if(request.rowId) {
                    deleteCount = JsonStore.deleteByRowId(request.rowId)
                } else {
                    Log.e(this.#tag, 'Missing row ID in incoming DB Delete message', {messageStr, session})
                }
                const response = new DatabaseResponse()
                response.messageId = request.messageId
                response.deleteCount = deleteCount
                server.sendMessage(JSON.stringify(response), session.sessionId, [session.subprotocols[0]])
                break
            }
        }
    }
}