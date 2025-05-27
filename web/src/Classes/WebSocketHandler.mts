import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mjs'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.mjs'

export default class WebSocketHandler {
    static async getDatabaseClient(): Promise<WebSocketClient> {
        // TODO: Check if we have a password hash stored in the config already, if so skip fetching the salt.
        const response = await fetch('http://localhost:8080/api/salt', {
            headers: { Authorization: `Bearer ${ValueUtils.safeBase64Encode('boll')}` } // TODO: Get username from config
        })
        let passwordHash: string = ''
        if (response.ok) {
            const json = await response.json()
            passwordHash = await ValueUtils.hashPassword(
                'test', // TODO: Get password from config
                ValueUtils.decodeBytes(json.salt),
                true
            )
            // TODO: Store passwordHash in config and clear password
        } else {
            throw new Error('Failed to fetch salt for WebSocket client.')
        }
        return new WebSocketClient({
            clientName: 'Database Client',
            serverUrl: 'ws://localhost:7712', // TODO: Get port and host (?) from config
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