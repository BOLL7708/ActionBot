import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('The anchor type for the overlay.')
export class OptionPipeAnchorType extends AbstractOption {
    @Documentation('Overlay is fixed in the world.')
    static readonly World = 'World'

    @Documentation('Overlay is fixed to the headset.')
    static readonly Head = 'Head'

    @Documentation('Overlay is fixed to the left hand.')
    static readonly LeftHand = 'LeftHand'

    @Documentation('Overlay is fixed to the right hand.')
    static readonly RightHand = 'RightHand'
}