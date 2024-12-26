import {EnlistData} from '../../lib/index.mts'
import DiscordHandler from '../Vendor/DiscordHandler.mts'
import HttpHandler from "./Server/HttpHandler.mts";
import WebSocketHandler from "./Server/WebSocketHandler.mts";

export default class BotController {
    static async init() {
        EnlistData.run()
        const http = new HttpHandler()
        const ws = new WebSocketHandler()
    }
}