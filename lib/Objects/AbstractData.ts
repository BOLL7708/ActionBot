import {IDictionary} from '../SharedUtils/Dictionary.ts'
import ValueUtils from '../SharedUtils/ValueUtils.ts'
import {ReferenceTypeBuilder, Type} from './Data/DataType.ts'

// What input should result in when parsed
type TDataStoreParsed = Record<string, unknown>

// Database meta data
export interface IDataStoreInfo {
    rowId: number
    rowCreated: Date | undefined
    rowModified: Date | undefined
    groupClass: string
    groupKey: string
    parentId: number
}

type TDataStorePrimitives = boolean | number | string
type TDataStoreMethods = (...args: never) => unknown
type TDataStoreTypes =
    | TDataStorePrimitives
    | TDataStorePrimitives[]
    | IDictionary<TDataStorePrimitives>
    | TDataStoreMethods

/**
 * A shallow data class, properties stores the most basic primitive types or an array or dictionary storing said types.
 * - There is `__info()` and `__setInfo()` to manage a private data store for database meta information.
 * - There is `__apply()` to apply a JSON string or object onto the class that implements this class.
 *
 */
export abstract class AbstractData {
    /* We allow properties of these types */
    [key: string]: TDataStoreTypes

    /* Private property filled with values from the database */
    #info: IDataStoreInfo = {
        rowId: 0,
        rowCreated: undefined,
        rowModified: undefined,
        groupClass: '',
        groupKey: '',
        parentId: 0
    }
    __info(): IDataStoreInfo {
        return this.#info
    }

    __setInfo(info: IDataStoreInfo) {
        this.#info = info
    }

    static get ref(): ReferenceTypeBuilder {
        return new ReferenceTypeBuilder(this.name)
    }

    /** Apply JSON data to an object */
    __apply(input: string | TDataStoreParsed): typeof this {
        // Skip if no input
        if (ValueUtils.isBlank(input)) {
            console.warn('Input was blank.')
            return this
        }
        // Parse if input was a string
        if (typeof input === 'string') {
            const jsonResult = ValueUtils.safeJsonParse(input)
            if (jsonResult && typeof jsonResult === 'object') input = jsonResult as TDataStoreParsed
        }
        // Check if we can use the result
        if (
            typeof input !== 'object'
            || Array.isArray(input)
        ) {
            console.warn('Input parsed to not an object or an array (which is an object too).', typeof input)
            return this
        }
        // Map the values from input to this instance
        const keys = [...new Set([
            ...Object.keys(this),
            ...Object.keys(Object.getPrototypeOf(this))
        ])]
        const inputKeys = Object.keys(input)
        const allowedTypes = [typeof false, typeof 0, typeof ''] as string[]
        for (const key of keys) {
            // Input value must not be null nor undefined.
            if (input[key] === null || input[key] === undefined) continue
            // The input property must exist on the instance.
            if (!inputKeys.includes(key)) continue
            // Types between input and instance properties must match each other.
            if (typeof this[key] !== typeof input[key]) continue

            // We do not match against the existing types in arrays or objects,
            // values are simply applied naively, we just filter on allowed types.

            // Arrays are checked explicitly as they are also objects but should be handled differently.
            if (Array.isArray(this[key]) && Array.isArray(input[key])) {
                this[key] = input[key].filter(item => allowedTypes.includes(typeof item))
            } else

                // Object values are also filtered on allowed primitives, where numbers can also be references.
            if (typeof input[key] === 'object') {
                this[key] = Object.fromEntries(
                    Object.entries(input[key])
                        .filter(([_key, value]) => allowedTypes.includes(typeof value))
                )
            }

            // Primitives are applied
            else if (allowedTypes.includes(typeof input[key])) {
                this[key] = input[key] as TDataStoreTypes
            } else console.warn(`Unable to apply ${key} to instance, value:`, input[key])
        }
        return this
    }
}