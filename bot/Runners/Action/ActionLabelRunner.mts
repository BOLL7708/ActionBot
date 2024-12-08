import {ActionLabel, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import DataFileUtils from '../../Utils/DataFileUtils.mts'

// deno-lint-ignore require-await
ActionLabel.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Label action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionLabel)
         for (const text of ArrayUtils.getAsType(clone.textEntries, clone.textEntries_use)) {
            if (clone.append) {
               DataFileUtils.appendText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
            } else {
               DataFileUtils.writeText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
            }
         }
      }
   }
}