import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.js'
import Constants from './Constants.js'
import StorageHelper from './StorageHelper.js'

export default class WebSocketFactory {
    static _databaseClient: WebSocketClient|undefined = undefined
    static getDatabaseClient(): WebSocketClient {
        if(this._databaseClient) return this._databaseClient

        const passwordHash = StorageHelper.get('pwd-hash') ?? ''
        const port = StorageHelper.get('ws-port') ?? Constants.DEFAULT_WS_PORT
        const host = window.location.hostname
        const wsc = new WebSocketClient({
            clientName: 'Database Client',
            serverUrl: `ws://${host}:${port}`,
            subprotocolValues: ['database', passwordHash],
            onOpen: () => {
                console.log('WebSocket connection opened for database client.')
            },
            onMessage: (message) => {
                const response = new DatabaseResponse().__apply(message.data)
                if (ValueUtils.isNotBlank(response.messageId)) {
                    wsc.resolvePromise(response.messageId, response)
                }
            },
            onError: (error) => {
                console.error('WebSocket error:', error)
            },
            onClose: () => {
                console.log('WebSocket connection closed for database client.')
            }
        })
        this._databaseClient = wsc
        return wsc
    }
}