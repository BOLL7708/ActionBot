import {DataUtils, TriggerReward} from '../../../lib/index.mts'
import Log from '../../../lib/SharedUtils/Log.mts'
import {ActionHandler} from '../../Classes/Actions.mts'
import {ITwitchReward} from '../../Classes/Api/TwitchEventSub.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

TriggerReward.prototype.register = async function (eventKey: string) {
    const modules = ModulesSingleton.getInstance()
    const handler = new ActionHandler(eventKey)
    const rewardPreset = DataUtils.ensureItem(this.rewardID)
    if(rewardPreset) {
        const reward: ITwitchReward = { id: rewardPreset.dataSingle.key, handler }
        modules.twitchEventSub.registerReward(reward)
    } else {
        Log.w(this.__getClass(), `No Reward ID for <${eventKey}>, it might be missing a reward config.`)
    }
}