import WebSocketServer, { IWebSocketServerSession } from '../../DenoUtils/WebSocketServer.mts'
import AbstractWebsocketHandler from './AbstractWebsocketHandler.mts'

export default class PresenterHandler extends AbstractWebsocketHandler {
    override handle(server: WebSocketServer, message: string, session: IWebSocketServerSession): void {

    }
}