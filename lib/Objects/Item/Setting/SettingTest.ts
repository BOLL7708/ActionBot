import {Enlist} from '../../Decorators.ts'
import {AbstractSetting} from './AbstractSetting.ts'

@Enlist()
export class SettingTest extends AbstractSetting {
    stringValue: string = ''
    numberValue: number = 0
    booleanValue: boolean = false
}