class Screenshots {
    private _socket: WebSockets
    private _messageCounter: number = 0
    private _screenshotRequests: ITwitchRedemptionMessage[] = []
    private _messageCallback: IScreenshotCallback = (data) => { console.warn('Screenshot: unhandled response') }
    constructor() {
        let config:IScreenshotConfig = Config.instance.screenshots
        this._socket = new WebSockets(`ws://localhost:${config.port}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init();
    }
    private onMessage(evt) {
        let data: IScreenshotResponse = JSON.parse(evt.data)
        this._messageCallback(data)
    }
    private onError(evt) {
        // console.table(evt)
    }
    setScreenshotCallback(callback: IScreenshotCallback) {
        this._messageCallback = callback
    }
    sendScreenshotRequest(rewardData:ITwitchRedemptionMessage, delaySeconds:number) {
        this._messageCounter++
        let message:IScreenshotRequest = {
            nonce: `${this._messageCounter}`,
            delay: delaySeconds,
            tag: rewardData.redemption.user.login
        }
        this._screenshotRequests[this._messageCounter] = rewardData
        this._socket.send(JSON.stringify(message))
    }
    getScreenshotRequest(nonce: number):ITwitchRedemptionMessage {
        return this._screenshotRequests.splice(nonce, 1).pop()
    }
}