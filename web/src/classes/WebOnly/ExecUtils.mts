import {TRunType} from '../../../../lib/Types/Exec.mts'
import BrowserUtils from '../Client/BrowserUtils.mts'
import Utils from '../../../../bot/Utils/Utils.mts'
import {OptionCommandType} from '../../../../lib/index.mts'
import {ActionInput} from '../../../../lib/index.mts'

export default class ExecUtils {
    static runCommand(window: string, type: TRunType, command: string, postfixEnterStroke: boolean = true) {
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        BrowserUtils.getAuth()
        fetch(
            `_run.php?window=${windowb64}&type=${type}&command=${commandb64}&enter=${postfixEnterStroke ? 1 : 0}`,
            BrowserUtils.getAuthInit()
        ).then()
    }

    static runCommandsFromAction(action: ActionInput) {
        // Store command strings for possible reset
        const commands: string[] = []
        
        // Build command string
        const isKeys = action.type == OptionCommandType.Keys
        const glue = isKeys && action.postfixEnterStroke ? '{ENTER}' : ''
        let index = 0
        const commandString = action.commands.map((cmd)=>{
            commands[index] = cmd.command // Store command without value for possible reset
            index++
            return cmd.value.length > 0 ? `${cmd.command} ${cmd.value}` : cmd.command
        }).join(glue)

        // Execute command
        this.runCommand(action.window, action.type, commandString, action.postfixEnterStroke)

        // Reset if we should
        if(action.duration > 0) {
            setTimeout(()=>{               
                // Build command string with reset values
                index = 0
                const defaultCommandString = action.commands.map((cmd)=>{
                    const command = commands[index] // Retrieve command for reset
                    index++
                    return cmd.defaultValue.length > 0 ? `${command} ${cmd.defaultValue}` : command
                }).join(glue)
                this.runCommand(action.window, action.type, defaultCommandString, action.postfixEnterStroke)
            }, action.duration*1000)
        }
    }

    static loadCustomURI(uri: string) {
        fetch(
            `_uri.php?uri=${Utils.encode(uri)}`,
            BrowserUtils.getAuthInit()
        ).then()
    }
}