import {AbstractData, DataEntries} from '../AbstractData.ts'
import {IBooleanDictionary, IDictionary, INumberDictionary, IStringDictionary} from '../../../Types/Dictionary.ts'
import {DataMap} from '../DataMap.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

export class ConfigTest extends AbstractData {
    anInstance = new ConfigTestSub()
    singleReference: number|DataEntries<PresetTest> = 0
    multiReference: number[]|DataEntries<PresetTest> = []
    namedReference: INumberDictionary|DataEntries<PresetTest> = {}
    singleNumber: number = 0
    multiNumber: number[] = []
    namedNumber: INumberDictionary = {}
    singleString: string = ''
    multiString: string[] = []
    namedString: IStringDictionary = {}
    singleBoolean: boolean = false
    multiBoolean: boolean[] = []
    namedBoolean: IBooleanDictionary = {}
    singleInstance = new PresetTest()
    multiInstance: PresetTest[] = []
    namedInstance: IDictionary<PresetTest> = {}

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigTest(),
            description: 'A test config used when testing specific features.',
            types: {
                singleReference: PresetTest.ref.id.build(),
                multiReference: PresetTest.ref.id.build(),
                namedReference: PresetTest.ref.id.build(),
                multiNumber: 'number',
                namedNumber: 'number',
                multiString: 'string',
                namedString: 'string',
                multiBoolean: 'boolean',
                namedBoolean: 'boolean',
                multiInstance: PresetTest.ref.build(),
                namedInstance: PresetTest.ref.build()
            }
        })
    }
}

export class ConfigTestSub extends AbstractData {
    value: number = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigTestSub(),
            documentation: {value: 'A number.'}
        })
    }
}