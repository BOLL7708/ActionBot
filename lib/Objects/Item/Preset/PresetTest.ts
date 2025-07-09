import {Enlist, Item, Primitive, Purpose} from '../../Decorators.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractPreset} from './AbstractPreset.ts'

@Enlist()
@Purpose('A test preset.')
export class PresetTest extends AbstractPreset {
    @Primitive
    value: string = ''

    @Item(SettingTest.ref)
    reference: number = 0
}