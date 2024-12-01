import WebSockets from '../Client/WebSockets.mts'
import {IScreenshotRequestData} from '../../../lib-shared/index.mts'
import {ConfigScreenshots} from '../../../lib-shared/index.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import {IActionUser} from '../../../lib-shared/index.mts'

export default class SuperScreenShotterVR {
    private _socket?: WebSockets
    private _messageCounter: number = 0
    private _screenshotRequests: Map<number, IScreenshotRequestData> = new Map()
    private _messageCallback: ISSSVRCallback = (requestResponse) => { console.warn('Screenshot: unhandled response') }
    private _config = new ConfigScreenshots()
    constructor() {}
    async init() {
        this._config = await DatabaseHelper.loadMain(new ConfigScreenshots())
        this._socket = new WebSockets(`ws://localhost:${this._config.SSSVRPort}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init();
    }
    private onMessage(evt: MessageEvent) {
        let data: ISSSVRResponse
        try {
            data = JSON.parse(evt.data)
        } catch (e) {
            console.warn('SSSVR: Failed to parse response', evt.data, e)
            return
        }
        const id = parseInt(data?.nonce ?? '')
        const requestData = this._screenshotRequests.get(id)
        if(data != undefined) {
            if(data.error) {
                console.error('SSSVR: Screenshot request failed', data.nonce, data.message, data.error)
            } else {
                this._messageCallback(requestData, data)
                this._screenshotRequests.delete(id)
            }
        }
    }
    private onError(evt: Event) {
        // console.table(evt)
    }
    isConnected() {
        return this._socket?.isConnected() ?? false
    }
    setScreenshotCallback(callback: ISSSVRCallback) {
        this._messageCallback = callback
    }
    sendScreenshotRequest(eventKey: string, userData: IActionUser, delaySeconds: number = 0) {
        this._messageCounter++
        this._screenshotRequests.set(this._messageCounter, {
            eventKey: eventKey,
            userId: userData.id,
            userName: userData.login,
            userInput: userData.input
        })
        const message:ISSSVRRequest = {
            nonce: `${this._messageCounter}`,
            delay: delaySeconds,
            tag: userData.login
        }
        this._socket?.send(JSON.stringify(message))
    }
}

// SuperScreenShotterVR
export interface ISSSVRRequest {
    nonce: string
    tag: string
    delay: number
}
export interface ISSSVRResponse {
    nonce: string
    image: string
    width: number
    height: number
    filePath: string
    message: string
    error: string
}

// Callbacks
export interface ISSSVRCallback {
    (screenshotRequest: IScreenshotRequestData|undefined, screenshotResponse: ISSSVRResponse): void
}