import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../../SharedUtils/Dictionary.ts'
import {Enlist, Item, Purpose, Value} from '../../Decorators.ts'
import {Type} from '../../DecoratorType.ts'
import {PresetTest} from '../Preset/PresetTest.ts'
import {AbstractConfig} from './AbstractConfig.ts'

@Enlist()
@Purpose('A test config used when testing specific features.')
export class ConfigTest extends AbstractConfig {
    @Item(PresetTest.ref.id)
    singleReference: number = 0

    @Item(PresetTest.ref.id)
    multiReference: number[] = []

    @Item(PresetTest.ref.id)
    namedReference: INumberDictionary = {}

    @Item(AbstractConfig.ref.id)
    genericSingleReference: number = 0

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