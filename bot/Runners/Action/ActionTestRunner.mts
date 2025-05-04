import {ActionTest, IActionCallback, IActionUser} from '../../../lib/index.mts'
import Log from '../../../lib/SharedUtils/Log.mts'

// deno-lint-ignore require-await
ActionTest.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers or toggles events',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         Log.d('ActionSystem', 'Running ActionTest', user, nonce, index)
      }
   }
}