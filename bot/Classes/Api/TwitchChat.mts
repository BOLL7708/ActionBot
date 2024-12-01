import WebSockets from '../Client/WebSockets.mts'
import TwitchHelixHelper from '../../Helpers/TwitchHelixHelper.mts'
import {DataUtils} from '../../../lib/index.mts'
import Utils from '../../Utils/Utils.mts'
import TwitchFactory, {ITwitchMessageCmd} from '../Data/TwitchFactory.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import {SettingTwitchTokens} from '../../../lib/index.mts'

export default class TwitchChat {
    private LOG_COLOR: string = 'purple'
    private _socket?: WebSockets
    private _isConnected: boolean = false
    private _userName: string = ''
    private _channel: string = ''
    private _listenToWhispers: boolean = false
    init(userName?: string, channel?: string, listenToWhispers: boolean = false) {
        if(!userName || !channel) return console.error(`Twitch Chat: Cannot initiate without proper username (${userName}) and channel (${channel}).`)
        this._userName = userName
        this._channel = channel
        this._listenToWhispers = listenToWhispers
        this._socket = new WebSockets(
            'wss://irc-ws.chat.twitch.tv:443',
            15,
            false,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this),
            this.onError.bind(this)
        )
        this._socket.init();
    }

    private _chatMessageCallback: ITwitchChatMessageCallback = (message) => {}
    registerChatMessageCallback(callback: ITwitchChatMessageCallback) {
        this._chatMessageCallback = callback
    }
    private _whisperMessageCallback: ITwitchWhisperMessageCallback = (message) => {}
    registerWhisperMessageCallback(callback: ITwitchWhisperMessageCallback) {
        this._whisperMessageCallback = callback
    }

    isConnected(): boolean {
        return this._isConnected
    }

    private async onOpen(evt: any) {
        const userData = await TwitchHelixHelper.getUserByLogin(this._userName)
        const tokens = DataUtils.getKeyDataDictionary(await DatabaseHelper.loadAll<SettingTwitchTokens>(new SettingTwitchTokens()) ?? {})
        const tokenData = tokens
            ? Object.values(tokens)?.find((t)=>{ return t.userId === parseInt(userData?.id ?? '') })
            : undefined
        Utils.log(`TwitchChat: Connected: ${this._userName} to #${this._channel}`, this.LOG_COLOR, true, true)
        this._socket?.send(`PASS oauth:${tokenData?.accessToken}`)
        this._socket?.send(`NICK ${this._userName}`)
        this._socket?.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands') // Enables more info
        this._socket?.send(`JOIN #${this._channel}`)
        this._isConnected = true
    }
    private onClose(evt: any) {
        this._isConnected = false
        Utils.log(`TwitchChat: Disconnected: ${this._userName}`, this.LOG_COLOR, true, true)
    }
    private onMessage(evt: any) {
        let data:string|undefined = evt?.data
        if(data != undefined) {
            if(data.indexOf('PING') == 0) return this._socket?.send('PONG :tmi.twitch.tv\r\n')
            let messageStrings = data.split("\r\n")
            messageStrings.forEach(str => {
                if(str == null || str.length == 0) return
                let message = TwitchFactory.buildMessageCmd(str)
                // console.log('TwitchChat', 'DATA | ', message.message.data, 'TEXT | ', message.message.text)
                // console.log('TwitchChat', message)
                switch(message.message.type) {
                    case 'PRIVMSG':
                        this._chatMessageCallback(message)
                        break
                    case 'WHISPER':
                        if(this._listenToWhispers) this._whisperMessageCallback(message)
                        break
                    default:
                        if(message.message.type) console.warn(`TwitchChat: Unhandled: ${message.message.type}`)
                }
            })
        }        
    }
    private onError(evt: any) {
        console.error(evt)
    }
    private testMessage(message: string) {
        this._chatMessageCallback(TwitchFactory.buildMessageCmd(message));
    }
    sendMessageToChannel(message: string) {
        this._socket?.send(`PRIVMSG #${this._channel} :${message}`)
    }

    sendMessageToUser(username: string, message: string) {
        this._socket?.send(`PRIVMSG #${this._channel} :/w ${username} ${message}`)
    }
}

export interface ITwitchChatMessageCallback {
    (message: ITwitchMessageCmd): void
}
export interface ITwitchWhisperMessageCallback {
    (message: ITwitchMessageCmd): void
}