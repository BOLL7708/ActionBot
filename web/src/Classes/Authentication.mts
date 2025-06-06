import Log from '../../../lib/SharedUtils/Log.mjs'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mjs'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.mjs'
import SystemMessage from '../../../lib/Types/WebSocket/SystemMessage.ts'
import StorageHelper from './StorageHelper.mjs'

interface ISaltResponse {
    salt: string
}
interface IErrorResponse {
    error: string
}
export type TAuthenticationResult = (ok: boolean) => void

export default class Authentication {
    /**
     * Verify the stored authentication
     * @param callback
     */
    static async verify(callback: TAuthenticationResult) {
        // Bring out stored values
        const username = StorageHelper.get('usr-name') ?? ''
        const passwordHash = StorageHelper.get('pwd-hash') ?? ''
        const wsPort = StorageHelper.getJson<number>('ws-port') ?? 7712

        // Cancel if values are missing
        if (ValueUtils.isBlank(username) || ValueUtils.isBlank(passwordHash)) {
            Log.w(this.name, 'No username or password hash found in storage.')
            return callback(false)
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
    static async login(port: number, username: string, password: string, callback: TAuthenticationResult) {
        const host = window.location.hostname
        const httpPort = import.meta.env.DEV ? 8080 : window.location.port
        const response = await fetch(`http://${host}:${httpPort}/api/salt`, {
            headers: { Authorization: `Bearer ${ValueUtils.safeBase64Encode(username)}` }
        })
        let passwordHash: string = ''
        if (response.ok) {
            const jsonStr = await response.text()
            const json = ValueUtils.safeJsonParse<ISaltResponse>(jsonStr)
            passwordHash = await ValueUtils.hashPassword(
                password,
                ValueUtils.decodeBytes(json?.salt ?? ''),
                true
            )
        } else {
            Log.e(this.name, 'Failed to fetch salt', response.statusText)
            return callback(false)
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
    private static async connect(port: number, username: string, passwordHash: string, callback: TAuthenticationResult) {
        const host = window.location.hostname
        const timeoutHandle = setTimeout(()=>{
            wsc.disconnect()
            callback(false)
        }, 5000)
        const wsc = new WebSocketClient({
            clientName: 'System Client',
            serverUrl: `ws://${host}:${port}`,
            subprotocolValues: ['system', passwordHash],
            onOpen: () => {
                const message = new SystemMessage()
                message.action = 'ping'
                wsc.send(JSON.stringify(message))
            },
            onMessage: (message) => {
                let messageObj = ValueUtils.safeJsonParse<{action:string}>(message.data)
                if(messageObj?.action === 'pong') {
                    StorageHelper.set('usr-name', username)
                    StorageHelper.set('pwd-hash', passwordHash)
                    StorageHelper.setJson('ws-port', port)
                    clearTimeout(timeoutHandle)
                    wsc.disconnect()
                    callback(true)
                }
            },
            onError: (error) => {
                Log.e(this.name, 'Authentication WebSocket error:', error)
            },
            onClose: () => {}
        })
        wsc.init()
    }
}