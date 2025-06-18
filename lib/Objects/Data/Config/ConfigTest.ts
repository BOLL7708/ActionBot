import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Purpose, Enlist, Value, Item} from '../../Decorators.ts'
import {AbstractData} from '../../AbstractData.ts'
import {Type} from '../DataType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'

@Enlist()
@Purpose('A test config used when testing specific features.')
export class ConfigTest extends AbstractData {
    @Item(PresetTest.ref.id)
    singleReference: number = 0

    @Item(PresetTest.ref.id)
    multiReference: number[] = []

    @Item(PresetTest.ref.id)
    namedReference: INumberDictionary = {}

    singleNumber: number = 0

    @Value(Type.number)
    multiNumber: number[] = []

    @Value(Type.number)
    namedNumber: INumberDictionary = {}

    singleString: string = ''

    @Value(Type.string)
    multiString: string[] = []

    @Value(Type.string)
    namedString: IStringDictionary = {}

    singleBoolean: boolean = false

    @Value(Type.boolean)
    multiBoolean: boolean[] = []

    @Value(Type.boolean)
    namedBoolean: IBooleanDictionary = {}
}