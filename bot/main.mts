import './Runners/index.mts'
import { EnlistData } from '../lib/index.mts'
import Log, { ELogLevel } from '../lib/SharedUtils/Log.mts'
import Bot from './Classes/Bot.mts'
import DatabaseHelper from './Helpers/DatabaseHelper.mts'

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
EnlistData.run()

/* Initialization */
Bot.init().then()
