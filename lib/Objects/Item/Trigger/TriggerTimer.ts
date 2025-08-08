import {AbstractTrigger} from "./AbstractTrigger.ts";
import Constants from "../../../Classes/Constants.ts";
import {About, Enlist, Primitive, Purpose} from "../../Decorators.ts";
import {IAbstractNodeHandle} from "../AbstractNode.ts";

@Enlist()
@Purpose('Have something happen automatically on a timer.')
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

    __nodeTopHandles(): IAbstractNodeHandle[] {
        return [ // TODO: Handles might need IDs unless we just assign them serially... the type ID might not be enough of a differentiator. SHIT!
            {
                type: Constants.nodeHandleIds.activate,
                label: 'Unpause'
            },
            {
                type: Constants.nodeHandleIds.activate,
                label: 'Pause'
            },
            {
                type: Constants.nodeHandleIds.activate,
                label: 'Reset'
            }
        ]
    }

    __nodeBottomHandles(): IAbstractNodeHandle[] {
        return [
            {
                type: Constants.nodeHandleIds.activate
            },
            {
                type: Constants.nodeHandleIds.number
            }
        ]
    }
}