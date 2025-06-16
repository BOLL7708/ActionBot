import {TRunType} from '../../Types/Exec.ts'
import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('What type of input to trigger with in the action.')
export class OptionCommandType extends AbstractOption {
    @Documentation('Will simulate keyboard input.')
    static readonly Keys: TRunType = 'keys'

    @Documentation('Will simulate mouse input.')
    static readonly Mouse: TRunType = 'mouse'
}