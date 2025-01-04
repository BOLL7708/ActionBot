import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.mts'

export default abstract class AbstractWebsocketHandler {
    abstract handle(server: WebSocketServer, message: string, session: IWebSocketServerSession): void
}