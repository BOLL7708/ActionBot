import {AbstractItem, TItemParsed} from '../Objects/AbstractItem.ts'
import {ItemMap} from '../Objects/ItemMap.ts'
import {IDictionary} from '../SharedUtils/Dictionary.ts'
import {TClassConstructor} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {IJsonStore, IJsonStoreDecoded} from '../Types/Database.ts'

export default class ItemHelper {
    static readonly #tag = this.name
    // TODO: Handle the conversion to and from data objects here
    //  THIS SHOULD BE CROSS PLATFORM, SO WE CAN RECREATE THINGS FROM DATA OVER WEBSOCKETS! YEAH!

    static recreateWithChildren<T extends AbstractItem>(items: IDictionary<IJsonStoreDecoded> | IDictionary<IJsonStore> | IJsonStore[]): T | undefined {
        // 1. Recreate the whole list of items, fill the private info property
        let rootItem: T | undefined
        const recreatedItems: IDictionary<AbstractItem> = {}
        for (const [_id, item] of Object.entries(items)) {
            let itemData: string | TItemParsed
            let jsonStore: IJsonStore
            if (item.hasOwnProperty('jsonStore')) {
                jsonStore = (item as IJsonStoreDecoded).jsonStore
                itemData = (item as IJsonStoreDecoded).jsonObj
            } else {
                jsonStore = (item as IJsonStore)
                itemData = (item as IJsonStore).json_blob
            }
            const className = jsonStore.group_class
            const id = jsonStore.row_id
            const itemMeta = ItemMap.get(className)
            if (!itemMeta?.classConstructor) {
                Log.e(this.#tag, `Catastrophic failure: Found no constructor for ${className} when recreating item ${id}.`)
                return undefined
            }
            const recreatedItem = this.recreateSingle(itemMeta.classConstructor, jsonStore, itemData)

            // 2. Use the first item as the root item
            if (!rootItem) rootItem = recreatedItem
            else recreatedItems[id] = recreatedItem
        }

        // 3. Put all other items into the children private property of the root item
        rootItem?.__setChildren(recreatedItems)

        return rootItem
    }

    static recreateSingle<T extends AbstractItem>(constructor: TClassConstructor<T>, jsonStore: IJsonStore, jsonObj: string | TItemParsed): T {
        const instance = new constructor()
        instance.__setInfo({
            rowId: jsonStore.row_id,
            rowCreated: new Date(jsonStore.row_created),
            rowModified: new Date(jsonStore.row_modified),
            groupClass: jsonStore.group_class,
            groupKey: jsonStore.group_key ?? undefined,
            parentId: jsonStore.parent_id ?? undefined
        })
        return instance.__apply(jsonObj)
    }

    static recreateSimple<T extends AbstractItem>(className: string, jsonObj: TItemParsed): T | undefined {
        const constructor = ItemMap.get(className)?.classConstructor
        if (!constructor) return
        const instance = new constructor()
        return instance.__apply(jsonObj)
    }
}
