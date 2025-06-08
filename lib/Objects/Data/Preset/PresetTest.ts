import {AbstractData} from '../AbstractData.ts'
import {DataMap} from '../DataMap.ts'

export class PresetTest extends AbstractData {
    public value: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetTest(),
            description: 'A test preset.'
        })
    }
}