import './Runners/index.ts'
import Log, { ELogLevel } from '../lib/SharedUtils/Log.ts'
import Bot from './Classes/Bot.ts'
import '../lib/index.ts'
import DatabaseHelper from './Helpers/DatabaseHelper.ts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */

/* Logging and testing settings */
Log.setOptions({
    logLevel: ELogLevel.None,
    stackLevel: ELogLevel.Error,
    useColors: true,
    tagPrefix: '[',
    tagPostfix: '] ',
    capitalizeTag: false
})
DatabaseHelper.isTesting = false

/* Initialization */
Bot.init().then()
