import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Enlist, Item, Primitive, Purpose, Value} from '../../Decorators.ts'
import {Type} from '../../DecoratorType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('A test config used when testing specific features.')
export class ConfigTest extends AbstractConfig {
    @Item(PresetTest.ref)
    singleReference: number = 0

    @Item(PresetTest.ref)
    multiReference: number[] = []

    @Item(PresetTest.ref)
    namedReference: INumberDictionary = {}

    @Item(AbstractConfig.ref)
    genericSingleReference: number = 0

    @Primitive
    singleNumber: number = 0

    @Value(Type.number)
    multiNumber: number[] = []

    @Value(Type.number)
    namedNumber: INumberDictionary = {}

    @Primitive
    singleString: string = ''

    @Value(Type.string)
    multiString: string[] = []

    @Value(Type.string)
    namedString: IStringDictionary = {}

    @Primitive
    singleBoolean: boolean = false

    @Value(Type.boolean)
    multiBoolean: boolean[] = []

    @Value(Type.boolean)
    namedBoolean: IBooleanDictionary = {}
}