import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The anchor type for the overlay.')
export class OptionPipeAnchorType extends AbstractOption {
    @About('Overlay is fixed in the world.')
    static readonly World = 'World'

    @About('Overlay is fixed to the headset.')
    static readonly Head = 'Head'

    @About('Overlay is fixed to the left hand.')
    static readonly LeftHand = 'LeftHand'

    @About('Overlay is fixed to the right hand.')
    static readonly RightHand = 'RightHand'
}