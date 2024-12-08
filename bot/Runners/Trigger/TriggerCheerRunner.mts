import { TriggerCheer } from '../../../lib/index.mts'
import Log from '../../../lib/SharedUtils/Log.mts'
import {ActionHandler} from '../../Classes/Actions.mts'
import {ITwitchCheer} from '../../Classes/Api/TwitchEventSub.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

TriggerCheer.prototype.register = async function(eventKey: string) {
    const modules = ModulesSingleton.getInstance()
    const actionHandler = new ActionHandler(eventKey)
    const cheer: ITwitchCheer = {
        bits: this.amount,
        handler: actionHandler
    }
    if(cheer.bits > 0) {
        modules.twitchEventSub.registerCheer(cheer)
    } else {
        Log.w(this.__getClass(), `Cannot register cheer event for: <${eventKey}>.`)
    }
}