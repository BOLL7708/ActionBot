import Config from '../Classes/Config.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import Utils from '../Classes/Utils.js'
import {ITwitchHelixRewardConfig} from '../Interfaces/itwitch_helix.js'
import {Actions} from './Actions.js'
import {EEventSource} from './Enums.js'
import {SettingTwitchReward} from '../Classes/SettingObjects.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'
import TwitchHelixHelper from '../Classes/TwitchHelixHelper.js'

export default class Rewards {
    public static async init() {
        /*
        .########..########.##......##....###....########..########...######.
        .##.....##.##.......##..##..##...##.##...##.....##.##.....##.##....##
        .##.....##.##.......##..##..##..##...##..##.....##.##.....##.##......
        .########..######...##..##..##.##.....##.########..##.....##..######.
        .##...##...##.......##..##..##.#########.##...##...##.....##.......##
        .##....##..##.......##..##..##.##.....##.##....##..##.....##.##....##
        .##.....##.########..###..###..##.....##.##.....##.########...######.
        */
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        // Load reward IDs from settings
        const storedRewards = await DataBaseHelper.loadSettingsDictionary(new SettingTwitchReward()) ?? {}

        // Create missing rewards if any
        const allRewardKeys = Utils.getAllEventKeys(true)
        const missingRewardKeys = allRewardKeys.filter(key => !Object.values(storedRewards)?.find(rewardData => rewardData.key == key))
        for(const key of missingRewardKeys) {
            const config = <ITwitchHelixRewardConfig> Utils.getEventConfig(key)?.triggers.reward
            if(config) {
                const configClone = Utils.clone(Array.isArray(config) ? config[0] : config)
                configClone.title = await Utils.replaceTagsInText(configClone.title, await Actions.buildEmptyUserData(EEventSource.Created, key))
                configClone.prompt = await Utils.replaceTagsInText(configClone.prompt, await Actions.buildEmptyUserData(EEventSource.Created, key))
                let reward = await TwitchHelixHelper.createReward(configClone)
                if(reward && reward.data && reward.data.length > 0) {
                    const newReward = new SettingTwitchReward()
                    newReward.key = key
                    await DataBaseHelper.saveSetting(newReward, reward.data[0].id)
                }
            } else {
                console.warn(`Reward ${key} is missing a setup.`)
            }
        }

        // Toggle TTS rewards
        TwitchHelixHelper.updateReward(await Utils.getRewardId('Speak'), {is_enabled: !states.ttsForAll}).then()

        // Enable default rewards
        const enableRewards = Config.twitch.alwaysOnRewards.filter(rewardKey => { return !Config.twitch.alwaysOffRewards.includes(rewardKey) })
        for(const key of enableRewards) {
            TwitchHelixHelper.updateReward(await Utils.getRewardId(key), {is_enabled: true}).then()
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.alwaysOffRewards) {
            TwitchHelixHelper.updateReward(await Utils.getRewardId(key), {is_enabled: false}).then()
        }
    }
}