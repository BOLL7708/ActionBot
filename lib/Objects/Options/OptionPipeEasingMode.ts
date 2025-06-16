import {Description, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The easing mode for the animation.')
export class OptionPipeEasingMode extends AbstractOption {
    static readonly In = 'In'
    static readonly Out = 'Out'
    static readonly InOut = 'InOut'
}