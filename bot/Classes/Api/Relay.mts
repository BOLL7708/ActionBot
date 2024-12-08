import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.mts'
import Color from '../../Constants/ColorConstants.mts'
import {ActionHandler} from '../Actions.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import Utils from '../../Utils/Utils.mts'
import {ConfigRelay} from '../../../lib/index.mts'
import {ConfigController} from '../../../lib/index.mts'

export default class Relay {
    private readonly _logColor = Color.ForestGreen
    private _socket: WebSocketClient|undefined = undefined
    private _authorized: boolean = false
    private readonly _prefix = ':::'
    private readonly _channel: string
    private readonly _password: string
    private _onMessageCallback: IOnRelayMessageCallback = (result)=>{ console.warn(`Unhandled Relay (${this._channel}) message: ${JSON.stringify(result)}`) }
    constructor(channel?: string, password?: string, onMessageCallback?: IOnRelayMessageCallback) {
        this._channel = channel ?? ''
        this._password = password ?? ''
        if(onMessageCallback) this._onMessageCallback = onMessageCallback
    }
    init() {
        const configRelay = DatabaseHelper.loadMain<ConfigRelay>(new ConfigRelay())
        this._socket = new WebSocketClient({
            clientName: 'Relay',
            serverUrl: `ws://localhost:${configRelay.port}`,
            reconnectIntervalSeconds: 10,
            messageQueueing: true,
            onOpen: this.onOpen.bind(this),
            onClose: this.onClose.bind(this),
            onMessage: this.onMessage.bind(this),
            onError: this.onError.bind(this)
        })
        const controllerConfig = DatabaseHelper.loadMain<ConfigController>(new ConfigController())
        if(controllerConfig.useWebsockets.relay) this._socket.init()
        else Utils.log('Relay: Will not init websockets as it is disabled in the config.', this._logColor)
    }
    setOnMessageCallback(callback: IOnRelayMessageCallback) {
        this._onMessageCallback = callback
        this.init()
    }

    send(message: string) {
        this._socket?.send(message)
    }

    sendJSON(data: any) {
        this.send(JSON.stringify(data))
    }

    private onOpen(evt: Event) {
        if(this._channel.length > 0) {
            Utils.log(`Relay: Connected, joining #${this._channel}...`, this._logColor)
            this._socket?.send(`${this._prefix}CHANNEL:${this._channel}`)
        }
        else Utils.log(`Relay: Entered general channel, ready for use!`, this._logColor, true)
    }
    private onMessage(evt: MessageEvent) {
        let message = evt.data as string
        if(message.startsWith(this._prefix)) {
            // Check if command
            message = message.substring(3) // Remove prefix
            const messageArr = message.split(':')
            if(messageArr.length == 3 && messageArr[1].length > 0) {
                switch(messageArr[0]) {
                    case 'SUCCESS':
                        const code = parseInt(messageArr[1])
                        if(code >= 10 && code < 20) { // Connected to channel
                            if(this._password.length > 0) {
                                Utils.log(`Relay: Entered #${this._channel}, doing authorization...`, this._logColor)
                                this._socket?.send(`${this._prefix}PASSWORD:${this._password}`)
                            } else {
                                Utils.log(`Relay: Entered #${this._channel}, ready for use!`, this._logColor, true)
                            }
                        } else if(code >= 20 && code < 30) { // Authorized
                            this._authorized = true
                            Utils.log(`Relay: Authorized for #${this._channel}, ready for use!`, this._logColor, true)
                        }
                        break
                    case 'ERROR':
                        console.warn("Relay: Error", messageArr)
                        this._authorized = false
                        this._socket?.disconnect() // Just start the flow over, hope for the best!
                        break
                    default: console.error(messageArr)
                }
            } else {
                Utils.log(`Relay: Received unhandled command response: ${message}`, Color.Red)
            }
            return
        }

        let json: any = undefined
        try {
            json = JSON.parse(message)
        } catch (e) {
            console.warn(`Relay: Got garbage: ${message}`)
        }
        if(json != undefined) {
            this._onMessageCallback(json)
        }
    }
    private onError(evt: Event) {
        // console.table(evt)
    }

    private onClose(event: Event) {
        this._authorized = false
    }
}

export interface IOnRelayMessageCallback {
    (result: any): void
}

export interface IRelayTempMessage {
    key: string,
    data: string
}

export interface IRelay {
    key: string
    handler?: ActionHandler
}