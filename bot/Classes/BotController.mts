import {EnlistData} from '../../lib/index.mts'
import DiscordHandler from '../Vendor/DiscordHandler.mts'

export default class BotController {
    static async init() {
        EnlistData.run()

    }
}