import {ActionOBS, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

// deno-lint-ignore require-await
ActionOBS.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an OBS action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionOBS)
         const modules = ModulesSingleton.getInstance()
         // clone.key = key TODO: Is this needed for the group toggling?
         const state = clone.state
         console.log("OBS Reward triggered")
         modules.obs.toggle(clone, state)
      }
   }
}