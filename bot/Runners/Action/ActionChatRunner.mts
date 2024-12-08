import SessionVars from '../../../bot/Classes/Data/SessionVars.mts'
import {ActionChat, IActionCallback, IActionUser, SettingTwitchTokens} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'

// deno-lint-ignore require-await
ActionChat.prototype.build = async function <T>(
   key: string,
   instance: T
): Promise<IActionCallback> {
   return {
      description: "Callback that triggers a Twitch chat message action",
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionChat)
         const modules = ModulesSingleton.getInstance()
         const entries = ArrayUtils.getAsType(
            ValueUtils.ensureArray(clone.entries),
            clone.entries_use,
            index
         )
         for (const entry of entries) {
            if (
               clone.onlySendNonRepeats &&
               entry == SessionVars.lastTwitchChatMessage
            ) continue
            if (clone.onlySendAfterUserMessage) {
               const userId = (DatabaseHelper.load<SettingTwitchTokens>(
                  new SettingTwitchTokens(),
                  "Chatbot"
               ))?.userId ?? 0
               if (
                  userId.toString() ==
                  SessionVars.lastTwitchChatterUserId
               ) continue
            }
            modules.twitch._twitchChatOut.sendMessageToChannel(
               await TextHelper.replaceTagsInText(entry, user)
            )
         }
      }
   }
}