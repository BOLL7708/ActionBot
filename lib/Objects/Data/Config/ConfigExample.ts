import {AbstractData, DataEntries, TDataArray, TDataDictionary, TDataSingle} from '../AbstractData.ts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.ts'
import {IBooleanDictionary, IDictionary, INumberDictionary, IStringDictionary} from '../../../Types/Dictionary.ts'
import {DataMap} from '../DataMap.ts'
import {DataUtils} from '../DataUtils.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

export class ConfigExample extends AbstractData {
    constructor(
        public singleBoolean = false,
        public singleNumber = 0,
        public singleNumberRange = 0,
        public singleString = '',
        public singleSecretString = '',
        public singleFileString = '',
        public singleSubInstance = new ConfigExampleSub(),
        public singleIdReference: TDataSingle<PresetTest> = 0,
        public singleIdReferenceUsingLabel: TDataSingle<PresetTest> = 0,
        public singleIdToGenericReference: TDataSingle<AbstractData> = 0, // TODO: Fix this to NOT use the abstract class as reference
        public singleEnum = OptionEntryUsage.First,
        public arrayOfBooleans: boolean[] = [],
        public arrayOfBooleans_use: number = 0,
        public arrayOfNumbers: number[] = [],
        public arrayOfStrings: string[] = [],
        public arrayOfStringsWithEmptyEntry: string[] = [''],
        public arrayOfSecretStrings: string[] = [],
        public arrayOfFileStrings: string[] = [],
        public arrayOfSubInstances: ConfigExampleSub[] = [],
        public arrayOfIdReferences: TDataArray<PresetTest> = [],
        public arrayOfIdReferencesUsingLabels: TDataArray<PresetTest> = [],
        public arrayOfIdToGenericReferences: TDataArray<AbstractData> = [], // TODO: Fix this to NOT use the abstract class as reference
        public arrayOfOptions: OptionEntryUsage[] = [],
        public dictionaryOfBooleans: IBooleanDictionary = {},
        public dictionaryOfNumbers: INumberDictionary = {},
        public dictionaryOfStrings: IStringDictionary = {},
        public dictionaryOfSubInstances: IDictionary<ConfigExampleSub> = {},
        public dictionaryOfIdReferences: TDataDictionary<PresetTest> = {},
        public dictionaryOfIdReferencesUsingLabels: TDataDictionary<PresetTest> = {},
        public dictionaryOfIdToGenericReferences: TDataDictionary<AbstractData> = {},
        public dictionaryOfEnums: IDictionary<OptionEntryUsage> = {},
        public partnerToSingle = '',
        public partnerToSingle_active = false,
        public partnerToSingleAdvanced = '',
        public partnerToSingleAdvanced_enum = OptionEntryUsage.First,
        public partnerToArray: string[] = [],
        public partnerToArray_withTitle = '',
        public partnerToDictionary: IStringDictionary = {},
        public partnerToDictionary_repeatsCount = 0,
        public partnerToOption = OptionEntryUsage.First,
        public partnerToOption_label = '',
        public partnerMultiple = false,
        public partnerMultiple_and = false,
        public partnerMultiple_or = 0,
        public partnerMultiple_plus = false,
        public partnerMultiple_butNot = ''
    ) {
        super()
    }
    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigExample(),
            description: 'This is an example config to display all types of values an object can contain and how to use them. It is not used in the widget.',
            documentation: {
                singleBoolean: 'A single boolean flag',
                singleNumber: 'A single number value',
                singleNumberRange: 'A single number value with a range',
                singleString: 'A single string value',
                singleSecretString: 'A single secret string value, use for passwords or API keys, etc.',
                singleSubInstance: 'A single instance of a sub-class',
                singleIdReference: 'A single ID reference to any other object',
                singleIdReferenceUsingLabel: 'A single ID reference displayed with a label',
                singleIdToGenericReference: 'Contains a single generic entry.',
                singleEnum: '',
                arrayOfBooleans: 'This is an array property with a partner field.',
                arrayOfBooleans_use: 'This is a separate property acting as the partner field.',
                arrayOfNumbers: '',
                arrayOfStrings: '',
                arrayOfSubInstances: '',
                arrayOfIdReferences: '',
                arrayOfIdReferencesUsingLabels: '',
                arrayOfIdToGenericReferences: 'Contains an array of generic entries.',
                arrayOfOptions: '',
                dictionaryOfBooleans: '',
                dictionaryOfNumbers: '',
                dictionaryOfStrings: '',
                dictionaryOfSubInstances: '',
                dictionaryOfIdReferences: '',
                dictionaryOfIdReferencesUsingLabels: '',
                dictionaryOfIdToGenericReferences: 'Contains a dictionary of generic entries.',
                dictionaryOfEnums: ''
            },
            types: {
                singleNumberRange: DataUtils.getNumberRangeRef(-100, 100, 5),
                singleSecretString: 'string|secret',
                singleFileString: DataUtils.getStringFileImageRef(),
                singleIdReference: PresetTest.ref.id.build(),
                singleIdReferenceUsingLabel: PresetTest.ref.id.label.build(),
                singleIdToGenericReference: AbstractData.genericRef('Setting').build(),
                singleEnum: OptionEntryUsage.ref,
                arrayOfBooleans: 'boolean',
                arrayOfBooleans_use: OptionEntryUsage.ref,
                arrayOfNumbers: 'number',
                arrayOfStrings: 'string',
                arrayOfStringsWithEmptyEntry: 'string',
                arrayOfSecretStrings: 'string|secret',
                arrayOfFileStrings: DataUtils.getStringFileImageRef(),
                arrayOfSubInstances: ConfigExampleSub.ref.build(),
                arrayOfIdReferences: PresetTest.ref.id.build(),
                arrayOfIdReferencesUsingLabels: PresetTest.ref.id.label.build(),
                arrayOfIdToGenericReferences: AbstractData.genericRef('Setting').build(),
                arrayOfOptions: OptionEntryUsage.ref,
                dictionaryOfBooleans: 'boolean',
                dictionaryOfNumbers: 'number',
                dictionaryOfStrings: 'string',
                dictionaryOfSubInstances: ConfigExampleSub.ref.build(),
                dictionaryOfIdReferences: PresetTest.ref.id.build(),
                dictionaryOfIdReferencesUsingLabels: PresetTest.ref.id.label.build(),
                dictionaryOfIdToGenericReferences: AbstractData.genericRef('Setting').build(),
                dictionaryOfEnums: OptionEntryUsage.ref,
                partnerToSingleAdvanced_enum: OptionEntryUsage.ref,
                partnerToArray: 'string',
                partnerToDictionary: 'string',
                partnerToOption: OptionEntryUsage.ref
            }
        })
    }
}
export class ConfigExampleSub extends AbstractData {
    constructor(
        public singleString: string = '',
        public singleIdReference: number|DataEntries<PresetTest> = 0,
        public singleEnum: number = OptionEntryUsage.All
    ) {
        super()
    }
    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigExampleSub(),
            documentation: {
                singleString: 'A string value',
                singleIdReference: 'A reference to an object'
            },
            types: {
                singleIdReference: PresetTest.ref.id.build(),
                singleEnum: OptionEntryUsage.ref
            }
        })
    }
}