import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'
import {OptionsMap} from '../OptionsMap.ts'

@Enlist()
@Purpose('The vertical alignment of the text inside the bounding box.')
export class OptionPipeTextAreaVerticalAlignment extends AbstractOption {
    static readonly Top = 'Top'
    static readonly Center = 'Center'
    static readonly Bottom = 'Bottom'
}