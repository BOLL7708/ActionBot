import {TRunType} from '../../Types/Exec.mts'
import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

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