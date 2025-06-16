import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.ts'
import {AbstractData} from '../AbstractData.ts'
import {Description, Documentation, Enlist, ReferenceType} from '../../Decorators.ts'

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
    @ReferenceType(Type.number.range(-100, 100, 5))
    singleNumberRange = 0

    @Documentation('A single string value')
    singleString = ''

    @Documentation('A single secret string value, use for passwords or API keys, etc.')
    @ReferenceType(Type.string.secret)
    singleSecretString = ''

    @ReferenceType(Type.string.files(DataUtils.getImageFileExtensions()))
    singleFileString = ''

    @Documentation('A single ID reference to any other object')
    @ReferenceType(PresetTest.ref.id)
    singleIdReference: number = 0

    @Documentation('A single ID reference displayed with a label')
    @ReferenceType(PresetTest.ref.id)
    singleIdReferenceUsingLabel: number = 0

    @Documentation('Contains a single generic entry.')
    @ReferenceType(Type.generic('Setting'))
    singleIdToGenericReference: number = 0

    @ReferenceType(OptionEntryUsage.ref)
    singleEnum = OptionEntryUsage.First

    @Documentation('This is an array property with a partner field.')
    @ReferenceType(Type.boolean)
    arrayOfBooleans: boolean[] = []

    @Documentation('This is a separate property acting as the partner field.')
    @ReferenceType(OptionEntryUsage.ref)
    arrayOfBooleans_use: number = 0

    @ReferenceType(Type.number)
    arrayOfNumbers: number[] = []

    @ReferenceType(Type.string)
    arrayOfStrings: string[] = []

    @ReferenceType(Type.string)
    arrayOfStringsWithEmptyEntry: string[] = ['']

    @ReferenceType(Type.string.secret)
    arrayOfSecretStrings: string[] = []

    @ReferenceType(Type.string.files(DataUtils.getImageFileExtensions()))
    arrayOfFileStrings: string[] = []

    @ReferenceType(PresetTest.ref.id)
    arrayOfIdReferences: number[] = []

    @ReferenceType(PresetTest.ref.id.label)
    arrayOfIdReferencesUsingLabels: number[] = []

    @Documentation('Contains an array of generic entries.')
    @ReferenceType(Type.generic('Setting'))
    arrayOfIdToGenericReferences: number[] = []

    arrayOfOptions: number[] = []

    @ReferenceType(Type.boolean)
    dictionaryOfBooleans: IBooleanDictionary = {}

    @ReferenceType(Type.number)
    dictionaryOfNumbers: INumberDictionary = {}

    @ReferenceType(Type.string)
    dictionaryOfStrings: IStringDictionary = {}

    @ReferenceType(PresetTest.ref.id)
    dictionaryOfIdReferences: INumberDictionary = {}

    @ReferenceType(PresetTest.ref.id.label)
    dictionaryOfIdReferencesUsingLabels: INumberDictionary = {}

    @Documentation('Contains a dictionary of generic entries.')
    @ReferenceType(Type.generic('Setting'))
    dictionaryOfIdToGenericReferences: INumberDictionary = {}

    @ReferenceType(OptionEntryUsage.ref)
    dictionaryOfEnums: INumberDictionary = {}

    partnerToSingle = ''

    partnerToSingle_active = false

    partnerToSingleAdvanced = ''

    @ReferenceType(OptionEntryUsage.ref)
    partnerToSingleAdvanced_enum = OptionEntryUsage.First

    @ReferenceType(Type.string)
    partnerToArray: string[] = []

    partnerToArray_withTitle = ''

    @ReferenceType(Type.string)
    partnerToDictionary: IStringDictionary = {}

    partnerToDictionary_repeatsCount = 0

    @ReferenceType(OptionEntryUsage.ref)
    partnerToOption = OptionEntryUsage.First

    partnerToOption_label = ''

    partnerMultiple = false

    partnerMultiple_and = false

    partnerMultiple_or = 0

    partnerMultiple_plus = false

    partnerMultiple_butNot = ''
}