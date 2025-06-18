import {Purpose, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'
import {OptionsMap} from '../OptionsMap.ts'

@Enlist()
@Purpose('The phase of the animation curve.')
export class OptionPipeAnimationPhase extends AbstractOption {
    static readonly Linear = 'Linear'
    static readonly Sine = 'Sine'
    static readonly Cosine = 'Cosine'
    static readonly NegativeSine = 'NegativeSine'
    static readonly NegativeCosine = 'NegativeCosine'
}