import {EEasyDebugLogLevel, EnlistData} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import {TWebSocketSubprotocol} from '../../lib/Types/WebSocket.mts'
import ModulesSingleton from '../Singletons/ModulesSingleton.mts'

export default class BotController {
    static async init() {
        EnlistData.run()
        Log.setLogLevel(EEasyDebugLogLevel.Verbose)
        Log.setStackLevel(EEasyDebugLogLevel.Error)
        // Connect to services
        // Initialize local services
        // More to initialize?

        // const id = await DiscordHandler.postToWebhook('This is a test posting hello!')
        // console.log(id)

        /* TODO
            Presenter presets
                Includes a name
            Implement something that will generate a link to the presenter with an ID that references the name of the presenter
                Include the ID of the preset database row in the URL as a query parameter or fragment value
            Connection
                When a presenter connects to the server, it will provide the ID as a sub-protocol, this will connect it to a presenter preset.
         */

        const modules = ModulesSingleton.getInstance()

        // TODO: Create a feature for the TTS module to return the values here, OR, send the message to the presenter form within the TTS module.
        const subprotocol: TWebSocketSubprotocol = 'presenter'
        let count = 0
        setInterval(() => {
            modules.ws.send(`This is a test message #${++count}`, [subprotocol, 'future-password', '0'])
        }, 3000)
    }
}