import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The easing mode for the animation.')
export class OptionMoveVRSpaceEasingMode extends AbstractOption {
    @Documentation('The easing will start slow and speed up.')
    static readonly in = 'In'

    @Documentation('The easing will start fast and slow down.')
    static readonly out = 'Out'

    @Documentation('The easing will start slow, speed up and slow down.')
    static readonly inOut = 'InOut'
}