import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.mjs'
import Constants from './Constants.mjs'
import StorageHelper from './StorageHelper.mjs'

export default class WebSocketFactory {
    static getDatabaseClient(): WebSocketClient {
        const passwordHash = StorageHelper.get('pwd-hash') ?? ''
        const port = StorageHelper.get('ws-port') ?? Constants.DEFAULT_WS_PORT
        const host = window.location.hostname
        return new WebSocketClient({
            clientName: 'Database Client',
            serverUrl: `ws://${host}:${port}`,
            subprotocolValues: ['database', passwordHash],
            onOpen: () => {
                console.log('WebSocket connection opened for database client.')
            },
            onMessage: (message) => {
                console.log('Received message:', message)
            },
            onError: (error) => {
                console.error('WebSocket error:', error)
            },
            onClose: () => {
                console.log('WebSocket connection closed for database client.')
            }
        })
    }
}