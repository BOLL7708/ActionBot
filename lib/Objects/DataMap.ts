import {IDictionary, IStringDictionary} from '../SharedUtils/Dictionary.ts'
import {TClassConstructor} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {IDataStoreType} from './Data/DataType.ts'

export interface IDataStoreMeta {
    // Main
    /** The constructor used to reinstate a JSON payload as a class. */
    classConstructor?: TClassConstructor
    /** A list of how to treat the fields of this class. */
    types?: IDictionary<IDataStoreType>
    /** List of field names that contain references to other classes. */
    references?: string[]
    /** List of field names that contain values based on an Option class. */
    options?: string[]
    /** List of fields that contain mutable collections of single type primitives. */
    primitives?: string[]

    // Interface
    tag?: string
    description?: string
    documentation?: IStringDictionary
    instructions?: IStringDictionary
}

export class DataMap {
    static readonly #tag = this.name
    static #map = new Map<string, IDataStoreMeta>

    static add(meta: IDataStoreMeta) {
        const className = meta.classConstructor?.name
        if (className) {
            Log.v(this.#tag, 'add', className)
            this.#map.set(className, meta)
        }
        else Log.w(this.#tag, 'Could not register meta as constructor was not found.', meta.classConstructor)
    }

    static get(className: string): IDataStoreMeta | undefined {
        const meta = this.#map.get(className)
        if (meta) {
            return meta
        } else Log.w(this.#tag, 'Could not retrieve meta for', className)
    }

    static has(className: string): boolean {
        return this.#map.has(className)
    }
}