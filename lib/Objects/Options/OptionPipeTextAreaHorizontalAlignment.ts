import {AbstractOption} from './AbstractOption.ts'
import {OptionsMap} from './OptionsMap.ts'

export class OptionPipeTextAreaHorizontalAlignment extends AbstractOption {
    static readonly Left = 'Left'
    static readonly Center = 'Center'
    static readonly Right = 'Right'
}
OptionsMap.addPrototype({
    prototype: OptionPipeTextAreaHorizontalAlignment,
    description: 'The horizontal alignment of the text inside the bounding box.',
    documentation: {}
})