import {ActionSettingVR, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'

// deno-lint-ignore require-await
ActionSettingVR.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an OpenVR2WSSetting action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionSettingVR)
         const modules = ModulesSingleton.getInstance()
         modules.openvr2ws.setSetting(clone)
      }
   }
}