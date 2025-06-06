import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class PresetTest extends AbstractData {
    public value: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetTest(),
            description: 'A test preset.'
        })
    }
}