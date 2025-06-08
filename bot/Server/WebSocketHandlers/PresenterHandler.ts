import WebSocketServer, { IWebSocketServerSession } from '../../DenoUtils/WebSocketServer.ts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.ts'

export default class PresenterHandler extends AbstractWebSocketHandler {
    override handle(server: WebSocketServer, message: string, session: IWebSocketServerSession): void {

    }
}