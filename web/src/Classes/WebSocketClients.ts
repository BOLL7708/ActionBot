import DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.js'
import Constants from './Constants.js'
import StorageHelper from './StorageHelper.js'

export default class WebSocketClients {
    static #tag = this.name
    static #databaseClient: WebSocketClient|undefined = undefined
    static get database(): WebSocketClient {
        if(this.#databaseClient) return this.#databaseClient

        const passwordHash = StorageHelper.get('pwd-hash') ?? ''
        const port = StorageHelper.get('ws-port') ?? Constants.DEFAULT_WS_PORT
        const host = window.location.hostname
        const wsc = new WebSocketClient({
            clientName: 'Database Client',
            serverUrl: `ws://${host}:${port}`,
            subprotocolValues: ['database', passwordHash],
            messageQueueing: true,
            messageMaxQueueSeconds: 10, // This should be generous as this ought to be a local request.
            onOpen: () => {
                Log.i(this.#tag, 'WebSocket connection opened for database client.')
            },
            onMessage: (message) => {
                const response = new DatabaseResponse().__apply(message.data)
                if (ValueUtils.isNotBlank(response.messageId)) {
                    wsc.resolvePromise(response.messageId, response)
                }
            },
            onError: (error) => {
                Log.e(this.#tag, 'WebSocket error:', error)
            },
            onClose: () => {
                Log.i(this.#tag, 'WebSocket connection closed for database client.')
            }
        })
        return this.#databaseClient = wsc
    }
}