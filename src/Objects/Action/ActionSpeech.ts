import DataMap from '../DataMap.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {SettingUser, SettingUserVoice} from '../Setting/SettingUser.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {SettingTwitchTokens} from '../Setting/SettingTwitch.js'
import TextHelper from '../../Classes/TextHelper.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import {ETTSType} from '../../Pages/Widget/Enums.js'
import Utils from '../../Classes/Utils.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'

export class ActionSpeech extends Action {
    entries: string[] = []
    entries_use = OptionEntryUsage.First
    skipDictionary: boolean = false
    voiceOfUser: number|string = 0
    voiceOfUser_orUsername: string = ''
    type = OptionTTSType.Announcement

    enlist() {
        DataMap.addRootInstance(
            new ActionSpeech(),
            'Trigger the TTS to read a message.',
            {
                entries: 'The strings of text to read out loud.',
                skipDictionary: 'Set to true to not use the word replacement dictionary.',
                voiceOfUser: 'Use the voice of a specific user or username. Leave empty to use the trigger value.'
            },
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref(),
                voiceOfUser: SettingUser.refIdKeyLabel(),
                type: OptionTTSType.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '🗣',
            description: 'Callback that triggers something spoken with TTS.',
            call: async (user: IActionUser, index?: number) => {
                const clone = Utils.clone<ActionSpeech>(this)
                const modules = ModulesSingleton.getInstance()
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
                const voiceUserId = parseInt(
                    Utils.ensureObjectNotId(clone.voiceOfUser)
                    ?? (await TwitchHelixHelper.getUserByLogin(clone.voiceOfUser_orUsername))?.id
                    ?? ''
                )
                for(const ttsStr of entries) {
                    await modules.tts.enqueueSpeakSentence(
                        ttsStr,
                        isNaN(voiceUserId) ? chatbotTokens?.userId : voiceUserId,
                        clone.type,
                        '', // TODO: Figure out if we can uses nonces again, I'm sure it's needed for something.
                        undefined,
                        undefined,
                        clone.skipDictionary
                    )
                }
            }
        }
    }
}