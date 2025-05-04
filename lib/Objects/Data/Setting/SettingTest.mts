import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class SettingTest extends AbstractData {
    stringValue: string = ''
    numberValue: number = 0
    booleanValue: boolean = false

    enlist() {
        DataMap.addRootInstance({ instance: new SettingTest() })
    }
}