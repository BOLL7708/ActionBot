import WebSocketServer, { IWebSocketServerSession } from '../../DenoUtils/WebSocketServer.mts'
import AbstractWebSocketHandler from './AbstractWebSocketHandler.mts'

export default class PresenterHandler extends AbstractWebSocketHandler {
    override handle(server: WebSocketServer, message: string, session: IWebSocketServerSession): void {

    }
}