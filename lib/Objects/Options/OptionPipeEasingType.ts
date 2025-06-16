import {Description, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The easing type for the animation.')
export class OptionPipeEasingType extends AbstractOption {
    static readonly Linear = 'Linear'
    static readonly Sine = 'Sine'
    static readonly Quad = 'Quad'
    static readonly Cubic = 'Cubic'
    static readonly Quart = 'Quart'
    static readonly Quint = 'Quint'
    static readonly Expo = 'Expo'
    static readonly Circ = 'Circ'
    static readonly Back = 'Back'
    static readonly Elastic = 'Elastic'
    static readonly Bounce = 'Bounce'
}