import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.mts'

export default abstract class AbstractWebSocketHandler {
    abstract handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void
}