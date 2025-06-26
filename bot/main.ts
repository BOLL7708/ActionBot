import './Runners/index.ts'
import '../lib/index.ts'
import Log, {ELogLevel} from '../lib/SharedUtils/Log.ts'
import Bot from './Classes/Bot.ts'
import JsonStoreHelper from './Helpers/JsonStoreHelper.ts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */

/* Logging and testing settings */
Log.setOptions({
    logLevel: ELogLevel.Verbose
})
JsonStoreHelper.isTesting = false

/* Initialization */
Bot.init().then()
