import {IDictionary} from '../SharedUtils/Dictionary.ts'
import Log from '../SharedUtils/Log.ts'
import ValueUtils from '../SharedUtils/ValueUtils.ts'
import {ItemTypeBuilder} from './DecoratorType.ts'

// What input should result in when parsed
export type TItemParsed = Record<string, unknown>

// Database meta data
export interface IItemInfo {
    rowId: number
    rowCreated: Date | undefined
    rowModified: Date | undefined
    groupClass: string
    groupKey: string | undefined
    parentId: number | undefined
}

type TDataPrimitives = boolean | number | string
type TDataMethods = (...args: never) => unknown
type TDataTypes =
    | TDataPrimitives
    | TDataPrimitives[]
    | IDictionary<TDataPrimitives>
    | TDataMethods

/**
 * A shallow data class, properties stores the most basic primitive types or an array or dictionary storing said types.
 * - There is `__info()` and `__setInfo()` to manage a private data store for database meta information.
 * - There is `__apply()` to apply a JSON string or object onto the class that implements this class.
 *
 */
export abstract class AbstractItem {
    /* We allow fields of these types */
    [key: string]: NonNullable<TDataTypes>

    readonly #tag = 'AbstractItem'

    /* Private fields filled with values from the database */
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

    __children(): IDictionary<AbstractItem> {
        return this.#children
    }

    __setChildren(children: IDictionary<AbstractItem>) {
        this.#children = children
    }

    static get ref(): ItemTypeBuilder {
        return new ItemTypeBuilder(this.name, !!this.name.match(/^abstract/i))
    }

    /** Apply JSON or JSON derived data to an object */
    __apply(input: string | TItemParsed): typeof this {
        // Skip if no input
        if (ValueUtils.isBlank(input)) {
            Log.w(this.#tag, 'Input was blank.')
            return this
        }

        // Parse if input was a string
        if (typeof input === 'string') {
            const jsonResult = ValueUtils.safeJsonParse<TItemParsed>(input)
            if (jsonResult && typeof jsonResult === 'object') input = jsonResult
            else Log.w(this.#tag, 'Input was string but not JSON.', {input})
        }

        // Check if we can use the result
        if (
            Array.isArray(input)
            || typeof input !== 'object'
        ) {
            Log.w(this.#tag, 'The parsed input is an array object or not an object.', typeof input)
            return this
        }

        // Map the values from input to this instance
        const allowedTypes = [typeof false, typeof 0, typeof ''] as string[]
        const keys = [...new Set([
            ...Object.keys(this),
            ...Object.keys(Object.getPrototypeOf(this))
        ])]
        const keysMap = ValueUtils.getCaseMap(keys)
        const keysLowerCase = Object.keys(keysMap)
        const inputKeys = Object.keys(input)
        const inputKeysMap = ValueUtils.getCaseMap(inputKeys)
        const inputKeysLowerCase = Object.keys(inputKeysMap)
        for (const keyLowerCase of keysLowerCase) {
            // The input property must exist on the instance.
            if (!inputKeysLowerCase.includes(keyLowerCase)) {
                continue
            }
            const key = keysMap[keyLowerCase]
            const inputKey = inputKeysMap[keyLowerCase]

            // Input value must not be null nor undefined.
            if (input[inputKey] === null || input[inputKey] === undefined) {
                Log.v(this.#tag, 'Skipped due to input being null or undefined:', key, input[inputKey])
                continue
            }
            // Types between input and instance properties must match each other.
            if (typeof this[key] !== typeof input[inputKey]) {
                // We try to convert here because JavaScript can put string values from inputs into number fields on a class, annoyingly.
                const newInput = ValueUtils.tryToMatchTypes(this[key], input[inputKey])
                if (newInput !== undefined) {
                    input[inputKey] = newInput
                } else {
                    Log.v(this.#tag, 'Skipped due being the wrong type:', key, input[inputKey])
                    continue
                }
            }

            // We do not match against the existing types in arrays or objects,
            // values are simply applied naively, we just filter on allowed types.

            // Arrays are checked explicitly as they are also objects but should be handled differently.
            if (Array.isArray(this[key]) && Array.isArray(input[inputKey])) {
                this[key] = input[inputKey].filter(item => allowedTypes.includes(typeof item))
            }

            // Object values are also filtered on allowed primitives, where numbers can also be references.
            else if (typeof input[inputKey] === 'object' && input[inputKey] !== null) {
                this[key] = Object.fromEntries(
                    Object.entries(input[inputKey])
                        .filter(([_key, value]) => allowedTypes.includes(typeof value))
                )
            }

            // Primitives are applied
            else if (allowedTypes.includes(typeof input[inputKey])) {
                this[key] = input[inputKey] as TDataTypes
            } else Log.w(this.#tag, `Unable to apply ${key} to instance, value:`, input[inputKey])
        }
        return this
    }
}