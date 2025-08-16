import {IDictionary, INumberDictionary, IStringDictionary} from '../SharedUtils/Dictionary.ts'
import Log from '../SharedUtils/Log.ts'
import {IClassNodeHandle, IMetaBase} from './Decorators.ts'
import {IItemType} from './DecoratorType.ts'

export interface IItemMeta extends IMetaBase {
    // region Data Format
    /** A list of how to treat the fields of this class. */
    fields?: IDictionary<IItemType>
    fieldTypes: {
        /** List of field names that contain references to other classes. */
        items?: string[]
        /** List of field names that contain values based on an Option class. */
        options?: string[]
        /** List of fields that contain mutable collections of single type primitives. */
        values?: string[]
    }
    // endregion

    // region Json Editor Interface
    tag?: string
    purpose?: string
    about?: IStringDictionary
    help?: IStringDictionary
    // endregion

    // region Node Editor
    handleInTypes?: IDictionary<IClassNodeHandle>
    handleOutTypes?: IDictionary<IClassNodeHandle>
    // endregion
}

export class ItemMap {
    static readonly #tag = this.name
    static #map = new Map<string, IItemMeta>

    static add(meta: IItemMeta) {
        const className = meta.classConstructor?.name
        if (className) {
            Log.v(this.#tag, 'add', className)
            this.#map.set(className, meta)
        } else Log.w(this.#tag, 'Could not register meta as constructor was not found.', meta.classConstructor)
    }

    static get(className: string): IItemMeta | undefined {
        const meta = this.#map.get(className)
        if (meta) {
            return meta
        } else Log.w(this.#tag, 'Could not retrieve meta for', className)
    }

    static has(className: string): boolean {
        return this.#map.has(className)
    }

    static getRange(startsWith: string): IDictionary<IItemMeta> {
        return Object.fromEntries(
            Array.from(this.#map)
            .filter(([key, _value]) => key.startsWith(startsWith))
        )
    }
}