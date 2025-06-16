import {Description, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('The horizontal alignment of the text inside the bounding box.')
export class OptionPipeTextAreaHorizontalAlignment extends AbstractOption {
    static readonly Left = 'Left'
    static readonly Center = 'Center'
    static readonly Right = 'Right'
}