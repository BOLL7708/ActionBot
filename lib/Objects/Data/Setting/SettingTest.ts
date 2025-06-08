import {AbstractData} from '../AbstractData.ts'
import {DataMap} from '../DataMap.ts'

export class SettingTest extends AbstractData {
    constructor(
        public stringValue: string = '',
        public numberValue: number = 0,
        public booleanValue: boolean = false
    ) {
        super()
    }
    enlist() {
        DataMap.addRootInstance({
            instance: new SettingTest()
        })
    }
}