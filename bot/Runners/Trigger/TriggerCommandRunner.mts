import { TriggerCommand } from '../../../lib/index.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

// deno-lint-ignore require-await
TriggerCommand.prototype.register = async function(eventKey: string) {
    const modules = ModulesSingleton.getInstance()
    if(this.entries.length > 0) {
        modules.twitch.registerCommandTrigger(this, eventKey)
    }
}