import {AbstractData} from '../../AbstractData.ts'
import {Enlist} from '../../Decorators.ts'
import {DataMap} from '../../DataMap.ts'

@Enlist()
export class SettingTest extends AbstractData {
    stringValue: string = ''
    numberValue: number = 0
    booleanValue: boolean = false
}