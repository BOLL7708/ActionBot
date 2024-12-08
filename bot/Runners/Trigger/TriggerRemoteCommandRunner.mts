import {TriggerRemoteCommand} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

TriggerRemoteCommand.prototype.register = async function(eventKey: string) {
    const modules = ModulesSingleton.getInstance()
    const clone = ValueUtils.clone<TriggerRemoteCommand>(this)
    if(this.entries.length) {
        for(let trigger of clone.entries) {
            modules.twitch.registerRemoteCommand(clone, eventKey)
        }
    }
}