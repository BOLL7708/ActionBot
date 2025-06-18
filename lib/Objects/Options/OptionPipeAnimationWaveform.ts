import {Purpose, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The waveform for the animation curve.')
export class OptionPipeAnimationWaveform extends AbstractOption {
    static readonly PhaseBased = 'PhaseBased'
}