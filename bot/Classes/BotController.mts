import {EnlistData} from '../../lib/index.mts'
import {TWebSocketSubprotocol} from '../../lib/Types/WebSocket.mts'
import ModulesSingleton from '../Singletons/ModulesSingleton.mts'

export default class BotController {
    static async init() {
        EnlistData.run()
        const http = new HttpHandler()
        const ws = new WebSocketHandler()

        const modules = ModulesSingleton.getInstance()
        const subprotocol: TWebSocketSubprotocol = 'presenter'
        let count = 0
        setInterval(() => {
            modules.ws.send(`This is a test message #${++count}`, [subprotocol, 'future-password', '0'])
        }, 3000)
    }
}