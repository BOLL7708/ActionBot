import {Description, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The property to animate.')
export class OptionPipeAnimationProperty extends AbstractOption {
    static readonly None = 'None'
    static readonly Yaw = 'Yaw'
    static readonly Pitch = 'Pitch'
    static readonly Roll = 'Roll'
    static readonly PositionX = 'PositionX'
    static readonly PositionY = 'PositionY'
    static readonly PositionZ = 'PositionZ'
    static readonly Scale = 'Scale'
    static readonly Opacity = 'Opacity'
}