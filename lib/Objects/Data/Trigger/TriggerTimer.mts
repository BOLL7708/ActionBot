import {DataMap} from '../DataMap.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

export class TriggerTimer extends AbstractTrigger {
    interval: number = 10
    repetitions: number = 0
    initialDelay: number = 0
    adjustIntervalEachTime: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerTimer(),
            tag: '⏰',
            description: 'Optional: Have something happen automatically on a timer.',
            documentation: {
                interval: 'The time in seconds between each trigger.',
                repetitions: 'The amount of times to trigger the event, zero or a negative value will repeat forever.',
                initialDelay: 'Delay in seconds before first run.',
                adjustIntervalEachTime: 'Increase or decrease the interval by this number of seconds each trigger.'
            }
        })
    }
}