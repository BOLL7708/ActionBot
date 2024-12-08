import {DataMap} from '../DataMap.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

export class TriggerCheer extends AbstractTrigger {
    amount: number = 1

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerCheer(),
            tag: '💰',
            description: 'A channel cheer',
            documentation: {
                amount: 'If a viewer cheers this specific bit amount it will trigger this event.'
            }
        })
    }
}