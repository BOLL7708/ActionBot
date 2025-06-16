import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Description, Enlist, ReferenceType} from '../../Decorators.ts'
import {AbstractData} from '../AbstractData.ts'
import {Type} from '../DataType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

@Enlist()
@Description('A test config used when testing specific features.')
export class ConfigTest extends AbstractData {
    @ReferenceType(PresetTest.ref.id)
    singleReference: number = 0

    @ReferenceType(PresetTest.ref.id)
    multiReference: number[] = []

    @ReferenceType(PresetTest.ref.id)
    namedReference: INumberDictionary = {}

    singleNumber: number = 0

    @ReferenceType(Type.number)
    multiNumber: number[] = []

    @ReferenceType(Type.number)
    namedNumber: INumberDictionary = {}

    singleString: string = ''

    @ReferenceType(Type.string)
    multiString: string[] = []

    @ReferenceType(Type.string)
    namedString: IStringDictionary = {}

    singleBoolean: boolean = false

    @ReferenceType(Type.boolean)
    multiBoolean: boolean[] = []

    @ReferenceType(Type.boolean)
    namedBoolean: IBooleanDictionary = {}
}