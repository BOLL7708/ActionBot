import {IDictionary} from '../SharedUtils/Dictionary.ts'
import Serializable, {TSerializableInput, TSerializableMethod} from '../SharedUtils/Serializable.ts'
import ValueUtils from '../SharedUtils/ValueUtils.ts'
import {ItemTypeBuilder} from './DecoratorType.ts'

// Database meta data
export interface IItemInfo {
    rowId: number
    rowCreated: Date | undefined
    rowModified: Date | undefined
    groupClass: string
    groupKey: string | undefined
    parentId: number | undefined
}

export const abstractItemAllowedPrimitives: string[] = [typeof false, typeof 0, typeof '']

type TAllowedPrimitives = boolean | number | string
type TAbstractItemTypes =
    | TAllowedPrimitives
    | TAllowedPrimitives[]
    | IDictionary<TAllowedPrimitives>
    | TSerializableMethod

/**
 * A shallow data class, properties stores the most basic primitive types or an array or dictionary storing said types.
 * - There is `__info()` and `__setInfo()` to manage a private data store for database meta information.
 * - There is `__apply()` to apply a JSON string or object onto the class that implements this class.
 */
export abstract class AbstractItem extends Serializable {
    /* Allowed field types, narrowed from what Serializable allows */
    [key: string]: NonNullable<TAbstractItemTypes>

    /** Tag for logging */
    readonly #tag = 'AbstractItem'

    /** Private fields filled with values from the database */
    #info: IItemInfo = {
        rowId: 0,
        rowCreated: undefined,
        rowModified: undefined,
        groupClass: '',
        groupKey: '',
        parentId: 0
    }

    __info(): IItemInfo {
        return this.#info
    }

    __setInfo(info: IItemInfo) {
        this.#info = info
    }

    #children: IDictionary<AbstractItem> = {}

    __children(ids: number[] = []): IDictionary<AbstractItem> {
        if (ids.length) {
            return Object.fromEntries(
                Object.entries(this.#children)
                    .filter(([id, _setting]) =>
                        ids.includes(ValueUtils.ensureNumber(id))
                    )
            )
        }
        return this.#children
    }

    __setChildren(children: IDictionary<AbstractItem>) {
        this.#children = children
    }

    static get ref(): ItemTypeBuilder {
        return new ItemTypeBuilder(this.name, !!this.name.match(/^abstract/i))
    }

    override __apply(input: TSerializableInput): typeof this {
        return super.__apply(input, abstractItemAllowedPrimitives)
    }
}