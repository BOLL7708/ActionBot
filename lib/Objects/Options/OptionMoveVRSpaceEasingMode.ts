import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The easing mode for the animation.')
export class OptionMoveVRSpaceEasingMode extends AbstractOption {
    @About('The easing will start slow and speed up.')
    static readonly in = 'In'

    @About('The easing will start fast and slow down.')
    static readonly out = 'Out'

    @About('The easing will start slow, speed up and slow down.')
    static readonly inOut = 'InOut'
}