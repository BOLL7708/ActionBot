import {DataMap} from '../DataMap.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

export class TriggerRemoteCommand extends AbstractTrigger {
    entries: string[] = ['']
    globalCooldown: number = 0
    userCooldown: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerRemoteCommand(),
            tag: '📡',
            description: 'The most basic command, used for remote execution.',
            documentation: {
                entries: 'The command or commands that can be used with this trigger.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.'
            },
            types: {
                entries: 'string'
            }
        })
    }
}