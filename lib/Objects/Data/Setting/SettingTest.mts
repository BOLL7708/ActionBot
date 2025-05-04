import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

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