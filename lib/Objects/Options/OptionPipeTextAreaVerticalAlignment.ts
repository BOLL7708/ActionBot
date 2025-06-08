import {AbstractOption} from './AbstractOption.ts'
import {OptionsMap} from './OptionsMap.ts'

export class OptionPipeTextAreaVerticalAlignment extends AbstractOption {
    static readonly Top = 'Top'
    static readonly Center = 'Center'
    static readonly Bottom = 'Bottom'
}
OptionsMap.addPrototype({
    prototype: OptionPipeTextAreaVerticalAlignment,
    description: 'The vertical alignment of the text inside the bounding box.',
    documentation: {}
})