import ModulesSingleton from '../../../bot/Singletons/ModulesSingleton.mts'
import {ActionCustom, IActionCallback, IActionUser} from '../../../lib/index.mts'
import Log from '../../../lib/SharedUtils/Log.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'

// deno-lint-ignore require-await
ActionCustom.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers arbitrary code',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         try {
            const clone = ValueUtils.clone(instance as ActionCustom)
            const modules = ModulesSingleton.getInstance()
            eval(clone.code)
         } catch (error) {
            Log.e(ActionCustom.name, `Error in custom action <${key}>`)
            console.warn(error)
         }
      }
   }
}