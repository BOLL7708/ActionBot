import SystemMessage from '../../../lib/Messages/WebSocket/SystemMessage.ts'
import Log from '../../../lib/SharedUtils/Log.js'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.js'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.js'
import StorageHelper from './StorageHelper.js'

interface ISaltResponse {
    salt: string
}
interface IErrorResponse {
    error: string
}
export type TAuthenticationStatus =
    | 'ok'
    | 'missing-credentials'
    | 'failed-fetching-salt'
    | 'bot-authentication-timeout'
    | 'bot-connection-error'
export type TAuthenticationCallback = (status: TAuthenticationStatus) => void

export default class Authentication {
    /**
     * Verify the stored authentication
     * @param callback
     */
    static async verify(callback: TAuthenticationCallback) {
        // Bring out stored values
        const username = StorageHelper.get('usr-name') ?? ''
        const passwordHash = StorageHelper.get('pwd-hash') ?? ''
        const wsPort = StorageHelper.getJson<number>('ws-port') ?? 7712

        // Cancel if values are missing
        if (ValueUtils.isBlank(username) || ValueUtils.isBlank(passwordHash)) {
            Log.w(this.name, 'No username or password hash found in storage.')
            return callback('missing-credentials')
        }

        // Verify through connecting to the bot
        await this.connect(wsPort, username, passwordHash, callback)
    }

    /**
     * Login to the bot, values will be stored if successful.
     * @param port
     * @param username
     * @param password
     * @param callback
     */
    static async login(port: number, username: string, password: string, callback: TAuthenticationCallback) {
        const host = window.location.hostname
        const httpPort = import.meta.env.DEV ? 8080 : window.location.port
        let response: Response|undefined
        try {
            response = await fetch(`http://${host}:${httpPort}/api/salt`, {
                headers: { Authorization: `Bearer ${ValueUtils.safeBase64Encode(username)}` }
            })
        } catch(e) {
            Log.e(this.name, 'Unable to connect to the server.', e)
        }
        let passwordHash: string = ''
        if (response?.ok) {
            const jsonStr = await response.text()
            const json = ValueUtils.safeJsonParse<ISaltResponse>(jsonStr)
            passwordHash = await ValueUtils.hashPassword(
                password,
                ValueUtils.decodeBytes(json?.salt ?? ''),
                true
            )
        } else {
            Log.e(this.name, 'Failed to fetch salt', response?.statusText)
            return callback('failed-fetching-salt')
        }
        await this.connect(port, username, passwordHash, callback)
    }

    /**
     * Perform a connection to the bot with the given port, username and password hash.
     * If the connection is successful, the username and password hash are stored in local storage.
     * If the connection fails, the callback is called with false.
     * @param port
     * @param username
     * @param passwordHash
     * @param callback
     * @private
     */
    private static async connect(port: number, username: string, passwordHash: string, callback: TAuthenticationCallback) {
        const host = window.location.hostname
        const timeoutHandle = setTimeout(()=>{
            wsc.disconnect()
            return callback('bot-authentication-timeout')
        }, 5000)
        const wsc = new WebSocketClient({
            clientName: 'System Client',
            serverUrl: `ws://${host}:${port}`,
            subprotocolValues: ['system', passwordHash],
            onOpen: () => {
                const message = new SystemMessage()
                message.action = 'ping'
                wsc.send(message)
            },
            onMessage: (message) => {
                let messageObj = new SystemMessage().__apply(message.data)
                if(messageObj.action === 'pong') {
                    StorageHelper.set('usr-name', username)
                    StorageHelper.set('pwd-hash', passwordHash)
                    StorageHelper.setJson('ws-port', port)
                    clearTimeout(timeoutHandle)
                    wsc.disconnect()
                    return callback('ok')
                }
            },
            onError: (error) => {
                Log.e(this.name, 'Authentication WebSocket error:', error)
                clearTimeout(timeoutHandle)
                return callback('bot-connection-error')
            },
            onClose: () => {}
        })
        wsc.init()
    }
}