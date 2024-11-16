import MainController from './Classes/MainController.mts'
import Log, {EEasyDebugLogLevel} from './EasyTSUtils/Log.mts'
import DataBaseHelper from './Helpers/DataBaseHelper.mts'

/**
 * Will initialize the bot backend component, this is run by the server.
 */
export async function bot() {
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        stackLevel: EEasyDebugLogLevel.Warning,
        useColors: true,
        tagPrefix: '[',
        tagPostfix: '] ',
        capitalizeTag: false
    })
    DataBaseHelper.isTesting = false

    // new Temp()
    await MainController.init()
}
