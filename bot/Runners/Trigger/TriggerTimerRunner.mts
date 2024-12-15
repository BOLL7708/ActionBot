import {EEventSource, TriggerTimer} from '../../../lib/index.mts'
import {ActionHandler, Actions} from '../../Classes/Actions.mts'

TriggerTimer.prototype.register = async function(eventKey: string) {
    const actionHandler = new ActionHandler(eventKey)
    const user = await Actions.buildEmptyUserData(EEventSource.Timer, eventKey)
    let handle: number|any = -1 // TODO: Transitional node fix
    let count = 0
    const times = this.repetitions ?? 0
    let interval = this.interval
    const delay = Math.max(0, (this.initialDelay ?? 10) - interval)
    setTimeout(()=>{
        handle = setInterval(()=>{
            actionHandler.call(user)
            count++
            interval += this.adjustIntervalEachTime
            if(times > 0) {
                if(count >= times) clearInterval(handle)
            }
        }, Math.max(0, interval)*1000)
    }, delay*1000)
}