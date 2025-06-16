import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('The easing type for the animation.')
export class OptionMoveVRSpaceEasingType extends AbstractOption {
    @Documentation('Linear, basically no effect.')
    static readonly linear = 'Linear'

    @Documentation('A sine wave.')
    static readonly sine = 'Sine'

    @Documentation('An x^2 curve.')
    static readonly quad = 'Quad'

    @Documentation('An x^3 curve.')
    static readonly cubic = 'Cubic'

    @Documentation('An x^4 curve.')
    static readonly quart = 'Quart'

    @Documentation('An x^5 curve.')
    static readonly quint = 'Quint'

    @Documentation('An x^x curve.')
    static readonly expo = 'Expo'

    @Documentation('A quarter circle, terminating at straight angles.')
    static readonly circ = 'Circ'

    @Documentation('A curve that backs up before going forward.')
    static readonly back = 'Back'

    @Documentation('A curve that wobbles smoothly.')
    static readonly elastic = 'Elastic'

    @Documentation('A curve that bounces hard.')
    static readonly bounce = 'Bounce'
}