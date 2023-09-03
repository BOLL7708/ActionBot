import Data, {IData} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetReward} from '../Preset/PresetReward.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'
import Trigger from '../Trigger.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import {ITwitchReward} from '../../Interfaces/itwitch.js'
import Utils from '../../Classes/Utils.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'
import {DataUtils} from '../DataUtils.js'

export class TriggerReward extends Trigger {
    permissions: number|IData<PresetPermissions> = 0
    rewardEntries: number[]|IData<Data> = [] // TODO: This is Data just to give it a parent, need to update this so it's not generic.
    rewardID: number|IData<string> = 0

    enlist() {
        DataMap.addRootInstance(new TriggerReward(),
            'This is a Twitch Channel Point Reward, triggered by a redemption on your channel page.',
            {
                permissions: 'Permission for who can redeem this reward.',
                rewardEntries: 'One or multiple reward presets. The first will be used on updates/resets, more are only needed when using a non-default event behavior.',
                rewardID: 'This is a reference to the reward on Twitch, leave empty to have it create a new reward when running the widget.'
            },
            {
                permissions: PresetPermissions.ref.id.build(),
                rewardID: SettingTwitchReward.ref.id.key.label.build(),
                rewardEntries: Data.genericRef('PresetReward').build() // I believe this was done to give these items a parent
            }
        )
    }

    register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const handler = new ActionHandler(eventKey)
        const id = DataUtils.ensureValue(this.rewardID)
        if(id) {
            const reward: ITwitchReward = { id, handler }
            modules.twitchEventSub.registerReward(reward)
        } else {
            Utils.logWithBold(`No Reward ID for <${eventKey}>, it might be missing a reward config.`, 'red')
        }
    }
}