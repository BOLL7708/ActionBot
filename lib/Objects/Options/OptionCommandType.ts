import {TRunType} from '../../Types/Exec.ts'
import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('What type of input to trigger with in the action.')
export class OptionCommandType extends AbstractOption {
    @About('Will simulate keyboard input.')
    static readonly Keys: TRunType = 'keys'

    @About('Will simulate mouse input.')
    static readonly Mouse: TRunType = 'mouse'
}