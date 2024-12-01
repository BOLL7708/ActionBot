import {ConfigController, ConfigSteam, DataUtils, EnlistData, SettingAccumulatingCounter, SettingDictionaryEntry, SettingIncrementingCounter, SettingStreamQuote, SettingTwitchClip, SettingTwitchRedemption, SettingTwitchReward, SettingTwitchTokens, SettingUser} from '../../lib-shared/index.mts'
// import PasswordForm from '../../web/src/classes/PasswordForm.mts'
import Color from '../Constants/ColorConstants.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.mts'
import TwitchTokensHelper from '../Helpers/TwitchTokensHelper.mts'
import ModulesSingleton from '../Singletons/ModulesSingleton.mts'
import StatesSingleton from '../Singletons/StatesSingleton.mts'
import Utils from '../Utils/Utils.mts'
import {Actions} from './Actions.mts'
import Callbacks from './Callbacks.mts'
import Functions from './Functions.mts'
import Rewards from './Rewards.mts'

export default class MainController {
    public static async init() {
        EnlistData.run()

        // const authed = await AuthUtils.checkIfAuthed()
        const authed = true
        if(!authed) {
            // PasswordForm.spawn()
            return
        }

        // Make sure settings are pre-cached
        DatabaseHelper.loadAll(new SettingUser())
        DatabaseHelper.loadAll(new SettingTwitchTokens())
        DatabaseHelper.loadAll(new SettingTwitchReward())
        DatabaseHelper.loadAll(new SettingTwitchRedemption())
        const dictionarySettings = DatabaseHelper.loadAll(new SettingDictionaryEntry())
        DatabaseHelper.loadAll(new SettingTwitchClip())
        DatabaseHelper.loadAll(new SettingIncrementingCounter())
        DatabaseHelper.loadAll(new SettingAccumulatingCounter())
        DatabaseHelper.loadAll(new SettingStreamQuote())

        const modules = ModulesSingleton.getInstance()
        modules.tts.setDictionary(DataUtils.getKeyDataDictionary(dictionarySettings ?? {}))


        await TwitchHelixHelper.loadNamesForUsersWhoLackThem()

        // region Init
        await StatesSingleton.initInstance() // Init states
        await this.startTwitchTokenRefreshInterval() // Init Twitch tokens
        const controllerConfig = await DatabaseHelper.loadMain<ConfigController>(new ConfigController())
        if(controllerConfig.useWebsockets.twitchEventSub) modules.twitchEventSub.init().then()

        modules.pipe.setOverlayTitle("desbot").then()

        Functions.setEmptySoundForTTS().then()

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval().then()

        // TODO: Should not the player summary be active at all time in case the user has websockets on but not playing VR?
        if(!controllerConfig.useWebsockets.openvr2ws) {
            MainController.startSteamPlayerSummaryInterval().then()
            const steamConfig = await DatabaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
            if(steamConfig.playerSummaryIntervalMs > 0) {
                await Functions.loadPlayerSummary()
            }
        }

        // Run init on classes that register things in the modules.
        await Rewards.init()
        await Actions.init()
        await Callbacks.init()

        await modules.twitch.init(controllerConfig.useWebsockets.twitchChat)
        if(controllerConfig.useWebsockets.openvr2ws) modules.openvr2ws.init().then()
        if(controllerConfig.useWebsockets.pipe) modules.pipe.init().then()
        if(controllerConfig.useWebsockets.obs) modules.obs.init()
        if(controllerConfig.useWebsockets.sssvr) modules.sssvr.init()
        // if(controllerConfig.useWebsockets.sdrelay) modules.streamDeckRelay.init().then() // TODO

        // endregion
    }


    // region Intervals

    public static async startTwitchTokenRefreshInterval() {
        const states = StatesSingleton.getInstance()
        await TwitchTokensHelper.refreshToken()
        if(states.twitchTokenRefreshIntervalHandle == -1) {
            Utils.log('Starting Twitch token refresh interval', Color.Green)
            states.twitchTokenRefreshIntervalHandle = setInterval(async() => {
                await TwitchTokensHelper.refreshToken()
            }, 1000 * 60 * 45) // 45 minutes for a chunky margin
        }
    }

    public static async startSteamPlayerSummaryInterval() {
        const states = StatesSingleton.getInstance()
        const steamConfig = await DatabaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
        if(
            steamConfig.playerSummaryIntervalMs
            && states.steamPlayerSummaryIntervalHandle == -1 
            && !ModulesSingleton.getInstance().openvr2ws.isConnected
        ) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            await Functions.loadPlayerSummary() // Get initial state immediately
            states.steamPlayerSummaryIntervalHandle = setInterval(async() => {
                await Functions.loadPlayerSummary()
            }, steamConfig.playerSummaryIntervalMs)
        }
    }

    public static async startSteamAchievementsInterval() {
        const steamConfig = await DatabaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
        if(steamConfig.achievementsIntervalMs) {
            Utils.log('Starting Steam achievements interval', Color.Green)
            const states = StatesSingleton.getInstance()
            states.steamAchievementsIntervalHandle = setInterval(async() => {
                await Functions.loadAchievements()
            }, steamConfig.achievementsIntervalMs)
        }
    }

    // endregion
}