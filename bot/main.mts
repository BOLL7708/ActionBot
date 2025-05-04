import './Runners/index.mts'
import Log, {ELogLevel} from '../lib/SharedUtils/Log.mts'
import Bot from './Classes/Bot.mts'
import DatabaseHelper from './Helpers/DatabaseHelper.mts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */

/* Logging and testing settings */
Log.setOptions({
    logLevel: ELogLevel.Verbose,
    stackLevel: ELogLevel.Warning,
    useColors: true,
    tagPrefix: '[',
    tagPostfix: '] ',
    capitalizeTag: false
})
DatabaseHelper.isTesting = false

/* Initialization */
Bot.init()