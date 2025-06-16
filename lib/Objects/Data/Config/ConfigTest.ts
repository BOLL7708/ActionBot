import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Description, Enlist, Primitive, Reference} from '../../Decorators.ts'
import {AbstractData} from '../../AbstractData.ts'
import {Type} from '../DataType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

@Enlist()
@Description('A test config used when testing specific features.')
export class ConfigTest extends AbstractData {
    @Reference(PresetTest.ref.id)
    singleReference: number = 0

    @Reference(PresetTest.ref.id)
    multiReference: number[] = []

    @Reference(PresetTest.ref.id)
    namedReference: INumberDictionary = {}

    singleNumber: number = 0

    @Primitive(Type.number)
    multiNumber: number[] = []

    @Primitive(Type.number)
    namedNumber: INumberDictionary = {}

    singleString: string = ''

    @Primitive(Type.string)
    multiString: string[] = []

    @Primitive(Type.string)
    namedString: IStringDictionary = {}

    singleBoolean: boolean = false

    @Primitive(Type.boolean)
    multiBoolean: boolean[] = []

    @Primitive(Type.boolean)
    namedBoolean: IBooleanDictionary = {}
}