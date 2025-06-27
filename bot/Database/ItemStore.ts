import ItemHelper from '../../lib/Classes/ItemHelper.ts'
import {AbstractItem, TClassConstructor} from '../../lib/index.ts'
import JsonStore from './JsonStore.ts'

export default class ItemStore {
    static readonly #mainKey: string = 'Main'

    static loadMain<T extends AbstractItem>(classConstructor: TClassConstructor<T>): T {
        return this.load(classConstructor, this.#mainKey)
    }
    static saveMain<T extends AbstractItem>(item: T): number {
        return this.save(item, this.#mainKey)
    }
    static load<T extends AbstractItem>(classConstructor: TClassConstructor<T>, key: string): T {
        const rootAndChildren = JsonStore.loadWithChildrenByGroupAndKey(classConstructor.name, key)
        const recreatedItem = ItemHelper.recreateWithChildren<T>(rootAndChildren)
        return recreatedItem ?? new classConstructor()
    }
    static save<T extends AbstractItem>(item: T, key: string): number {
        return JsonStore.save({
            group_class: item.constructor.name,
            group_key: key,
            parent_id: null,
            json_blob: JSON.stringify(item)
        })
    }
}