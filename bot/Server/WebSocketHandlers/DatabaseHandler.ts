import {IJsonStore} from '../../../lib/index.ts'
import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'
import JsonStore from '../../Database/JsonStore.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export default class DatabaseHandler extends AbstractWebSocketHandler {
    readonly #tag = this.constructor.name

    override handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void {
        const request = new DatabaseRequest().__apply(messageStr)
        Log.d(this.#tag, 'Received DB message', {message: request, session})
        switch (request.action) {
            case 'unknown':
                Log.w(this.#tag, 'Received unknown action', {message: request, session})
                break
            case 'load': {
                // Load from database
                let data: IJsonStore[] | undefined = []
                // Class and group key, used for Main configs and globalized items in general.
                if (ValueUtils.isNotBlank(request.groupClass) && ValueUtils.isNotBlank(request.groupKey)) {
                    data = Object.values(JsonStore.loadWithChildrenByGroupAndKey(
                        request.groupClass, request.groupKey
                    )).map(it => it.jsonStore)
                }
                // Only ID (class does not matter), used for all references stored in items and usually in the frontend code.
                else if (ValueUtils.ensureNumber(request.rowId) > 0) {
                    data = Object.values(JsonStore.loadWithChildrenByRowId(
                        request.rowId, ValueUtils.undefinedIfZeroOrLess(request.parentId)
                    )).map(it => it.jsonStore)
                }
                Log.i(this.#tag, 'DatabaseMessage', {data})

                // Build response
                if (data) {
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
                if (
                    request.groupClass && (
                        ValueUtils.isNotBlank(request.groupKey)
                        || ValueUtils.ensureNumber(request.parentId) > 0
                    )
                ) {
                    id = JsonStore.save({
                        row_id: ValueUtils.nullIfZeroOrLess(request.rowId) ?? undefined,
                        group_class: request.groupClass,
                        group_key: ValueUtils.nullIfBlank(request.groupKey),
                        parent_id: ValueUtils.nullIfZeroOrLess(request.parentId),
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
                if (ValueUtils.ensureNumber(request.rowId) > 0) {
                    deleteCount = JsonStore.deleteByRowId(request.rowId)
                } else if(Array.isArray(request.rowIds) && request.rowIds.length > 0) {
                    deleteCount = JsonStore.deleteByRowId(request.rowIds)
                } else {
                    Log.e(this.#tag, 'Missing row ID or IDs in incoming DB Delete message', {messageStr, session})
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