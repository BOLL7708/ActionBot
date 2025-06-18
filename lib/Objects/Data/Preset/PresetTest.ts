import {AbstractData} from '../../AbstractData.ts'
import {Purpose, Enlist} from '../../Decorators.ts'

@Enlist()
@Purpose('A test preset.')
export class PresetTest extends AbstractData {
    value: string = ''
}