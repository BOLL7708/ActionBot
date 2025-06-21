import {IDictionary, IStringDictionary} from '../SharedUtils/Dictionary.ts'
import Log from '../SharedUtils/Log.ts'
import {IDataStoreType} from './Data/DataType.ts'
import {IMetaBase} from './Decorators.ts'

export interface IDataMeta extends IMetaBase {
    // Main
    /** A list of how to treat the fields of this class. */
    fields?: IDictionary<IDataStoreType>
    fieldTypes: {
        /** List of field names that contain references to other classes. */
        items?: string[]
        /** List of field names that contain values based on an Option class. */
        options?: string[]
        /** List of fields that contain mutable collections of single type primitives. */
        values?: string[]
    }

    // Interface
    tag?: string
    purpose?: string
    about?: IStringDictionary
    help?: IStringDictionary
}

export class DataMap {
    static readonly #tag = this.name
    static #map = new Map<string, IDataMeta>

    static add(meta: IDataMeta) {
        const className = meta.classConstructor?.name
        if (className) {
            Log.v(this.#tag, 'add', className)
            this.#map.set(className, meta)
        } else Log.w(this.#tag, 'Could not register meta as constructor was not found.', meta.classConstructor)
    }

    static get(className: string): IDataMeta | undefined {
        const meta = this.#map.get(className)
        if (meta) {
            return meta
        } else Log.w(this.#tag, 'Could not retrieve meta for', className)
    }

    static has(className: string): boolean {
        return this.#map.has(className)
    }
}