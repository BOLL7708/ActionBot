import WebSocketServer, {IWebSocketServerSession} from '../../DenoUtils/WebSocketServer.ts'

export default abstract class AbstractWebSocketHandler {
    abstract handle(server: WebSocketServer, messageStr: string, session: IWebSocketServerSession): void
}