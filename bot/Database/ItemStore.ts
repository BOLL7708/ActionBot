import ItemHelper, {AbstractItemHelper} from '../../lib/Classes/ItemHelper.ts'
import {AbstractItem, IDictionary, IJsonStoreDecoded, IJsonStoreInput, TClassConstructor} from '../../lib/index.ts'
import JsonStore from './JsonStore.ts'

export default class ItemStore implements AbstractItemHelper {
    static #instance: ItemStore | undefined
    static #isInternal: boolean = false

    /**
     * This is a singleton only due to implementing abstract methods, which cannot be static.
     */
    static get do(): ItemStore {
        if (this.#instance == undefined) {
            this.#isInternal = true
            this.#instance = new ItemStore()
        }
        return this.#instance
    }

    private constructor() {
        if (!ItemStore.#isInternal) throw new TypeError('Class is not constructable.')
        ItemStore.#isInternal = false
    }

    // region Base
    load<T extends AbstractItem>(classConstructor: TClassConstructor<T>, keyOrId: string | number): T {
        let rootAndChildren: IDictionary<IJsonStoreDecoded> = {}
        switch (typeof keyOrId) {
            case 'string':
                rootAndChildren = JsonStore.loadWithChildrenByGroupAndKey(classConstructor.name, keyOrId)
                break
            case 'number':
                rootAndChildren = JsonStore.loadWithChildrenByRowId(keyOrId)
                break
        }
        const recreatedItem = ItemHelper.recreateWithChildren<T>(rootAndChildren)
        return recreatedItem ?? new classConstructor()
    }

    save<T extends AbstractItem>(item: T, keyOrParentId: string | number): number {
        const input: IJsonStoreInput = {
            group_class: item.constructor.name,
            group_key: null,
            parent_id: null,
            json_text: JSON.stringify(item)
        }
        switch (typeof keyOrParentId) {
            case 'string':
                input.group_key = keyOrParentId
                break
            case 'number':
                input.parent_id = keyOrParentId
                break
        }
        return JsonStore.save(input)
    }

    delete(rowId: number): number {
        return JsonStore.deleteByRowId(rowId)
    }

    // endregion

    // region Convenience
    loadMain<T extends AbstractItem>(classConstructor: TClassConstructor<T>): T {
        return this.load(classConstructor, ItemHelper.mainKey)
    }

    saveMain<T extends AbstractItem>(item: T): number {
        return this.save(item, ItemHelper.mainKey)
    }

    // endregion
}