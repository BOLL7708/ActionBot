import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.ts'
import {AbstractData} from '../../AbstractData.ts'
import {Purpose, About, Enlist, Option, Value, Item} from '../../Decorators.ts'

import {Type} from '../DataType.ts'
import {DataUtils} from '../DataUtils.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

@Enlist()
@Purpose('This is an example config to display all types of values an object can contain and how to use them. It is not used in the bot.')
export class ConfigExample extends AbstractData {
    @About('A single boolean flag')
    singleBoolean = false

    @About('A single number value')
    singleNumber = 0

    @About('A single number value with a range')
    @Value(Type.number.range(-100, 100, 5))
    singleNumberRange = 0

    @About('A single string value')
    singleString = ''

    @About('A single secret string value, use for passwords or API keys, etc.')
    @Value(Type.string.secret)
    singleSecretString = ''

    @Value(Type.string.files(DataUtils.getImageFileExtensions()))
    singleFileString = ''

    @About('A single ID reference to any other object')
    @Item(PresetTest.ref.id)
    singleIdReference: number = 0

    @About('A single ID reference displayed with a label')
    @Item(PresetTest.ref.id)
    singleIdReferenceUsingLabel: number = 0

    @About('Contains a single generic entry.')
    @Item(Type.generic('Setting'))
    singleIdToGenericReference: number = 0

    @Option(OptionEntryUsage.ref)
    singleEnum = OptionEntryUsage.First

    @About('This is an array property with a partner field.')
    @Value(Type.boolean)
    arrayOfBooleans: boolean[] = []

    @About('This is a separate property acting as the partner field.')
    @Option(OptionEntryUsage.ref)
    arrayOfBooleans_use: number = 0

    @Value(Type.number)
    arrayOfNumbers: number[] = []

    @Value(Type.string)
    arrayOfStrings: string[] = []

    @Value(Type.string)
    arrayOfStringsWithEmptyEntry: string[] = ['']

    @Value(Type.string.secret)
    arrayOfSecretStrings: string[] = []

    @Value(Type.string.files(DataUtils.getImageFileExtensions()))
    arrayOfFileStrings: string[] = []

    @Item(PresetTest.ref.id)
    arrayOfIdReferences: number[] = []

    @Item(PresetTest.ref.id.label)
    arrayOfIdReferencesUsingLabels: number[] = []

    @About('Contains an array of generic entries.')
    @Item(Type.generic('Setting'))
    arrayOfIdToGenericReferences: number[] = []

    arrayOfOptions: number[] = []

    @Value(Type.boolean)
    dictionaryOfBooleans: IBooleanDictionary = {}

    @Value(Type.number)
    dictionaryOfNumbers: INumberDictionary = {}

    @Value(Type.string)
    dictionaryOfStrings: IStringDictionary = {}

    @Item(PresetTest.ref.id)
    dictionaryOfIdReferences: INumberDictionary = {}

    @Item(PresetTest.ref.id.label)
    dictionaryOfIdReferencesUsingLabels: INumberDictionary = {}

    @About('Contains a dictionary of generic entries.')
    @Item(Type.generic('Setting'))
    dictionaryOfIdToGenericReferences: INumberDictionary = {}

    @Option(OptionEntryUsage.ref)
    dictionaryOfEnums: INumberDictionary = {}

    partnerToSingle = ''

    partnerToSingle_active = false

    partnerToSingleAdvanced = ''

    @Option(OptionEntryUsage.ref)
    partnerToSingleAdvanced_enum = OptionEntryUsage.First

    @Value(Type.string)
    partnerToArray: string[] = []

    partnerToArray_withTitle = ''

    @Value(Type.string)
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