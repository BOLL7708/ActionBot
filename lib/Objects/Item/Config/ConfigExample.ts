import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {About, Enlist, Item, Option, Primitive, Purpose, Value} from '../../Decorators.ts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.ts'

import {FileTypePresets, Type} from '../../DecoratorType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('This is an example config to display all types of values an object can contain and how to use them. It is not used in the bot.')
export class ConfigExample extends AbstractConfig {
    @About('A single boolean flag')
    @Primitive
    singleBoolean = false

    @About('A single number value')
    @Primitive
    singleNumber = 0

    @About('A single number value with a range')
    @Value(Type.number.range(-100, 100, 5))
    singleNumberRange = 0

    @About('A single string value')
    @Primitive
    singleString = ''

    @About('A single secret string value, use for passwords or API keys, etc.')
    @Value(Type.string.secret)
    singleSecretString = ''

    @Value(Type.string.files(FileTypePresets.audioFileExtensions))
    singleFileString = ''

    @About('A single ID reference to any other object')
    @Item(PresetTest.ref)
    singleIdReference: number = 0

    @About('A single ID reference displayed with a label')
    @Item(PresetTest.ref)
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

    @Value(Type.string.files(FileTypePresets.imageFileExtensions))
    arrayOfFileStrings: string[] = []

    @Item(PresetTest.ref)
    arrayOfIdReferences: number[] = []

    @Item(PresetTest.ref.label)
    arrayOfIdReferencesUsingLabels: number[] = []

    @About('Contains an array of generic entries.')
    @Item(Type.generic('Setting'))
    arrayOfIdToGenericReferences: number[] = []

    @Option(OptionEntryUsage.ref)
    arrayOfOptions: number[] = []

    @Value(Type.boolean)
    dictionaryOfBooleans: IBooleanDictionary = {}

    @Value(Type.number)
    dictionaryOfNumbers: INumberDictionary = {}

    @Value(Type.string)
    dictionaryOfStrings: IStringDictionary = {}

    @Item(PresetTest.ref)
    dictionaryOfIdReferences: INumberDictionary = {}

    @Item(PresetTest.ref.label)
    dictionaryOfIdReferencesUsingLabels: INumberDictionary = {}

    @About('Contains a dictionary of generic entries.')
    @Item(Type.generic('Setting'))
    dictionaryOfIdToGenericReferences: INumberDictionary = {}

    @Option(OptionEntryUsage.ref)
    dictionaryOfEnums: INumberDictionary = {}

    @Primitive
    partnerToSingle = ''

    @Primitive
    partnerToSingle_active = false

    @Primitive
    partnerToSingleAdvanced = ''

    @Option(OptionEntryUsage.ref)
    partnerToSingleAdvanced_enum = OptionEntryUsage.First

    @Value(Type.string)
    partnerToArray: string[] = []

    @Primitive
    partnerToArray_withTitle = ''

    @Value(Type.string)
    partnerToDictionary: IStringDictionary = {}

    @Primitive
    partnerToDictionary_repeatsCount = 0

    @Option(OptionEntryUsage.ref)
    partnerToOption = OptionEntryUsage.First

    @Primitive
    partnerToOption_label = ''

    @Primitive
    partnerMultiple = false

    @Primitive
    partnerMultiple_and = false

    @Primitive
    partnerMultiple_or = 0

    @Primitive
    partnerMultiple_plus = false

    @Primitive
    partnerMultiple_butNot = ''
}