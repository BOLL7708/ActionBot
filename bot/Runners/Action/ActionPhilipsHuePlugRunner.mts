import {ActionPhilipsHuePlug, DataUtils, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import PhilipsHueHelper from '../../Helpers/PhilipsHueHelper.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'

// deno-lint-ignore require-await
ActionPhilipsHuePlug.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Philips Hue plug action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionPhilipsHuePlug)
         const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
         PhilipsHueHelper.runPlugs(ids, clone.triggerState, clone.originalState, clone.duration)
      }
   }
}