import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import ActionCustom from '../../../Shared/Objects/Data/Action/ActionCustom.js'

class ActionCustomRunner extends ActionCustom {
    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers arbitrary code',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                try {
                    const clone = Utils.clone<ActionCustom>(this)
                    const modules = ModulesSingleton.getInstance()
                    eval(clone.code)
                } catch (error) {
                    Utils.logWithBold(`Error in custom action <${key}>`, 'red')
                    console.warn(error)
                }
            }
        }
    }
}