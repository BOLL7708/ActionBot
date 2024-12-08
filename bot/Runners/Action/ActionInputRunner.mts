import {ActionInput, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'

// deno-lint-ignore require-await
ActionInput.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an input action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = ValueUtils.clone(instance as ActionInput)
         clone.commands = ArrayUtils.getAsType(clone.commands, clone.commands_use, index)
         // TODO: Do something about this
         // ExecUtils.runCommandsFromAction(clone)
      }
   }
}