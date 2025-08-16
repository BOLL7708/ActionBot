import {AbstractTrigger} from "./AbstractTrigger.ts";
import Constants from "../../../Classes/Constants.ts";
import {About, Enlist, HandleIn, HandleOut, Primitive, Purpose} from "../../Decorators.ts";

@Enlist()
@Purpose('Have something happen automatically on a timer.')
@HandleIn({id: 1, label: 'Unpause', type: Constants.nodeHandleTypes.activate})
@HandleIn({id: 2, label: 'Pause', type: Constants.nodeHandleTypes.activate})
@HandleIn({id: 3, label: 'Restart', type: Constants.nodeHandleTypes.activate})
@HandleOut({id: 1, label: 'Activate', type: Constants.nodeHandleTypes.activate})
@HandleOut({id: 2, label: 'Iteration', type: Constants.nodeHandleTypes.activate})
export default class TriggerTimer extends AbstractTrigger {
    @Primitive
    @About('Will start paused so it needs to be externally activated.')
    paused: boolean = false;

    @Primitive
    @About('The time in seconds between each trigger.')
    interval: number = 10

    @Primitive
    @About('The amount of times to trigger the event, zero or a negative value will repeat forever.')
    repetitions: number = 0

    @Primitive
    @About('Delay in seconds before first run.')
    initialDelay: number = 0

    @Primitive
    @About('Increase or decrease the interval by this number of seconds each trigger.')
    adjustIntervalEachTime: number = 0

    __nodeText(): string {
        return `Every ${this.interval}s\nRepeats ${this.repetitions <= 0 ? 'indefinitely' : this.repetitions+'x'}`
    }
}