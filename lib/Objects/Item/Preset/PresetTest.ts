import {Enlist, Purpose} from '../../Decorators.ts'
import {AbstractPreset} from './AbstractPreset.ts'

@Enlist()
@Purpose('A test preset.')
export class PresetTest extends AbstractPreset {
    value: string = ''
}