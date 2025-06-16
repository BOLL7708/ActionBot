import {IDictionary, IStringDictionary} from '../SharedUtils/Dictionary.ts'
import {TClassConstructor} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {IDataStoreType} from './Data/DataType.ts'

export interface IDataStoreMeta {
    // Main
    classConstructor?: TClassConstructor
    types?: IDictionary<IDataStoreType>

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