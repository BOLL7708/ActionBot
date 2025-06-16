import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.ts'
import {AbstractData} from '../../AbstractData.ts'
import {Description, Documentation, Enlist, Option, Primitive, Reference} from '../../Decorators.ts'

import {Type} from '../DataType.ts'
import {DataUtils} from '../DataUtils.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

@Enlist()
@Description('This is an example config to display all types of values an object can contain and how to use them. It is not used in the bot.')
export class ConfigExample extends AbstractData {
    @Documentation('A single boolean flag')
    singleBoolean = false

    @Documentation('A single number value')
    singleNumber = 0

    @Documentation('A single number value with a range')
    @Primitive(Type.number.range(-100, 100, 5))
    singleNumberRange = 0

    @Documentation('A single string value')
    singleString = ''

    @Documentation('A single secret string value, use for passwords or API keys, etc.')
    @Primitive(Type.string.secret)
    singleSecretString = ''

    @Primitive(Type.string.files(DataUtils.getImageFileExtensions()))
    singleFileString = ''

    @Documentation('A single ID reference to any other object')
    @Reference(PresetTest.ref.id)
    singleIdReference: number = 0

    @Documentation('A single ID reference displayed with a label')
    @Reference(PresetTest.ref.id)
    singleIdReferenceUsingLabel: number = 0

    @Documentation('Contains a single generic entry.')
    @Reference(Type.generic('Setting'))
    singleIdToGenericReference: number = 0

    @Option(OptionEntryUsage.ref)
    singleEnum = OptionEntryUsage.First

    @Documentation('This is an array property with a partner field.')
    @Primitive(Type.boolean)
    arrayOfBooleans: boolean[] = []

    @Documentation('This is a separate property acting as the partner field.')
    @Option(OptionEntryUsage.ref)
    arrayOfBooleans_use: number = 0

    @Primitive(Type.number)
    arrayOfNumbers: number[] = []

    @Primitive(Type.string)
    arrayOfStrings: string[] = []

    @Primitive(Type.string)
    arrayOfStringsWithEmptyEntry: string[] = ['']

    @Primitive(Type.string.secret)
    arrayOfSecretStrings: string[] = []

    @Primitive(Type.string.files(DataUtils.getImageFileExtensions()))
    arrayOfFileStrings: string[] = []

    @Reference(PresetTest.ref.id)
    arrayOfIdReferences: number[] = []

    @Reference(PresetTest.ref.id.label)
    arrayOfIdReferencesUsingLabels: number[] = []

    @Documentation('Contains an array of generic entries.')
    @Reference(Type.generic('Setting'))
    arrayOfIdToGenericReferences: number[] = []

    arrayOfOptions: number[] = []

    @Primitive(Type.boolean)
    dictionaryOfBooleans: IBooleanDictionary = {}

    @Primitive(Type.number)
    dictionaryOfNumbers: INumberDictionary = {}

    @Primitive(Type.string)
    dictionaryOfStrings: IStringDictionary = {}

    @Reference(PresetTest.ref.id)
    dictionaryOfIdReferences: INumberDictionary = {}

    @Reference(PresetTest.ref.id.label)
    dictionaryOfIdReferencesUsingLabels: INumberDictionary = {}

    @Documentation('Contains a dictionary of generic entries.')
    @Reference(Type.generic('Setting'))
    dictionaryOfIdToGenericReferences: INumberDictionary = {}

    @Option(OptionEntryUsage.ref)
    dictionaryOfEnums: INumberDictionary = {}

    partnerToSingle = ''

    partnerToSingle_active = false

    partnerToSingleAdvanced = ''

    @Option(OptionEntryUsage.ref)
    partnerToSingleAdvanced_enum = OptionEntryUsage.First

    @Primitive(Type.string)
    partnerToArray: string[] = []

    partnerToArray_withTitle = ''

    @Primitive(Type.string)
    partnerToDictionary: IStringDictionary = {}

    partnerToDictionary_repeatsCount = 0

    @Option(OptionEntryUsage.ref)
    partnerToOption = OptionEntryUsage.First

    partnerToOption_label = ''

    partnerMultiple = false

    partnerMultiple_and = false

    partnerMultiple_or = 0

    partnerMultiple_plus = false

    partnerMultiple_butNot = ''
}