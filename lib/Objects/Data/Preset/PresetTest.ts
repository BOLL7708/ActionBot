import {AbstractData} from '../AbstractData.ts'
import {Description, Enlist} from '../../Decorators.ts'

@Enlist()
@Description('A test preset.')
export class PresetTest extends AbstractData {
    value: string = ''
}