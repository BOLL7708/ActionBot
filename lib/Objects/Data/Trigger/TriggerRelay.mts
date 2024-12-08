import {DataMap} from '../DataMap.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

export class TriggerRelay extends AbstractTrigger {
    key: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerRelay(),
            tag: '📞',
            description: 'A relay message from WSRelay',
            documentation: {
                key: 'Listen to incoming relay messages supplying this key.'
            }
        })
    }
}