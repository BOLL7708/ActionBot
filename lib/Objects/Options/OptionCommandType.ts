import {TRunType} from '../../Types/Exec.ts'
import {AbstractOption} from './AbstractOption.ts'
import {OptionsMap} from './OptionsMap.ts'

export class OptionCommandType extends AbstractOption {
    static readonly Keys: TRunType = 'keys'
    static readonly Mouse: TRunType = 'mouse'
}
OptionsMap.addPrototype({
    prototype: OptionCommandType,
    description: 'What type of input to trigger with in the action.',
    documentation: {
        Keys: 'Will simulate keyboard input.',
        Mouse: 'Will simulate mouse input.'
    }
})