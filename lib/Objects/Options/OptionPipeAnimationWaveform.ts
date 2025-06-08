import {AbstractOption} from './AbstractOption.ts'
import {OptionsMap} from './OptionsMap.ts'

export class OptionPipeAnimationWaveform extends AbstractOption {
    static readonly PhaseBased = 'PhaseBased'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnimationWaveform,
    description: 'The waveform for the animation curve.',
    documentation: {}
})