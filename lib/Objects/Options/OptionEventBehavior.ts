import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('Will affect how this event uses each entry of actions set on it.')
export class OptionEventBehavior extends AbstractOption {
    @About('Will run all the actions.')
    static readonly All = 0

    @About('Will run one random action.')
    static readonly Random = 100

    @About('Will run the actions in sequential order. (think multiple reward redemptions)')
    static readonly Incrementing = 200

    @About('Will accumulate a value until it reaches a goal. (useful for community challenge rewards)')
    static readonly Accumulating = 300

    @About('Will switch to the next state if done before the reset timer expires. (useful for leveling up rewards)')
    static readonly MultiTier = 400
}





