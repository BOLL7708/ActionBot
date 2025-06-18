import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The easing type for the animation.')
export class OptionMoveVRSpaceEasingType extends AbstractOption {
    @About('Linear, basically no effect.')
    static readonly linear = 'Linear'

    @About('A sine wave.')
    static readonly sine = 'Sine'

    @About('An x^2 curve.')
    static readonly quad = 'Quad'

    @About('An x^3 curve.')
    static readonly cubic = 'Cubic'

    @About('An x^4 curve.')
    static readonly quart = 'Quart'

    @About('An x^5 curve.')
    static readonly quint = 'Quint'

    @About('An x^x curve.')
    static readonly expo = 'Expo'

    @About('A quarter circle, terminating at straight angles.')
    static readonly circ = 'Circ'

    @About('A curve that backs up before going forward.')
    static readonly back = 'Back'

    @About('A curve that wobbles smoothly.')
    static readonly elastic = 'Elastic'

    @About('A curve that bounces hard.')
    static readonly bounce = 'Bounce'
}