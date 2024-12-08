import { TriggerRelay } from '../../../lib/index.mts'
import Log from '../../../lib/SharedUtils/Log.mts'
import {ActionHandler} from '../../Classes/Actions.mts'
import {IRelay} from '../../Classes/Api/Relay.mts'
import Callbacks from '../../Classes/Callbacks.mts'
import TextHelper from '../../Helpers/TextHelper.mts'

TriggerRelay.prototype.register = async function (eventKey: string) {
    const relay: IRelay = {
        key: TextHelper.replaceTags(this.key, {eventKey: eventKey}),
        handler: new ActionHandler(eventKey)
    }
    if(relay.key.length > 0) {
        Callbacks.registerRelay(relay)
    } else {
        Log.w(this.__getClass(), `Cannot register relay event for: <${eventKey}>.`)
    }
}