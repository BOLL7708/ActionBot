import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import AssetsHelper from '../../../Shared/Helpers/AssetsHelper.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import ActionAudio from '../../../Shared/Objects/Data/Action/ActionAudio.js'

class ActionAudioRunner extends ActionAudio {
    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a sound and/or speech action',
            awaitCall: true,
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionAudio>(this)
                clone.srcEntries = await AssetsHelper.preparePathsForUse(clone.srcEntries)
                clone.srcEntries = await TextHelper.replaceTagsInTextArray( // To support audio URLs in input
                    ArrayUtils.getAsType(Utils.ensureArray(clone.srcEntries), clone.srcEntries_use, index), // Need to read entries from config here as cloning drops __type
                    user
                )
                const modules = ModulesSingleton.getInstance()
                if(clone.onTTSQueue) modules.tts.enqueueSoundEffect(clone)
                else modules.audioPlayer.enqueueAudio(clone)
            }
        }
    }
}