import {Enlist, Primitive} from '../../Decorators.ts'
import {AbstractSetting} from './AbstractSetting.ts'

@Enlist()
export class SettingTest extends AbstractSetting {
    @Primitive
    stringValue: string = ''
    @Primitive
    numberValue: number = 0
    @Primitive
    booleanValue: boolean = false
}