import {WebSocketClient,IWebSocketClientOptions,ConfigController} from '../../../../lib/index.mts'
export default class BotClient {
    private _client: WebsocketClient
    private constructor(options: IWebSocketClientOptions) {
        options.onOpen = ()=>{

        }
        const config = new ConfigController()
        this._client = new WebSocketClient(options)
    }
}