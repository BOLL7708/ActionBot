import {
    IDictionary,
    IJsonStore,
    IJsonStoreDecoded,
    IJsonStoreInput,
    ItemMap,
    TDatabaseQueryInput,
    TSerializableParsedInput
} from '../../lib/index.ts'
import Log from '../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import Session from '../Classes/Session.ts'
import FileUtils from '../DenoUtils/FileUtils.ts'
import Sqlite from '../DenoUtils/Sqlite.ts'

export interface IDatabaseQueryKeys {
    where: string[]
    params: IDictionary<TDatabaseQueryInput>
}

export default class JsonStore {
    static readonly #tag = this.name
    static readonly OBJECT_MAIN_KEY: string = 'Main'
    static isTesting: boolean = false
    static #db: Sqlite | undefined

    static get #do(): Sqlite {
        if (!this.#db) {
            const directory = ValueUtils.isNotBlank(Session.databaseDirectory)
                ? `${Session.databaseDirectory}/db`
                : '../_user/db' // TODO: Or should we terminate? The above _should always be set_.
            try {
                Deno.mkdirSync(directory, {recursive: true})
            } catch(_e) {
                // Not sure if we need to handle this.
            }
            const filename = this.isTesting ? 'test.sqlite' : 'main.sqlite'
            this.#db = new Sqlite({
                name: this.OBJECT_MAIN_KEY,
                directory,
                filename,
                loggingProxy: Log.get(),
                structure: {json_store: [FileUtils.readText('../sql/structure.sql') ?? '']}
            })
        }
        return this.#db
    }

    static testConnection(): boolean {
        return this.#do.test()
    }

    static closeConnection() {
        return this.#do.kill()
    }

    // region Json Store
    // region Utils
    /**
     *
     * @param valueOrArray The single value or array that the keys will be generated for.
     * @param field The field name in the database we are referencing.
     * @param key The key name that will be used when serializing, gets appended with the serial number.
     * @private
     */
    private static buildKeys(
        valueOrArray: TDatabaseQueryInput | TDatabaseQueryInput[],
        field: string,
        key: string = ''
    ): IDatabaseQueryKeys {
        const result: IDatabaseQueryKeys = {where: [], params: {}}
        if (Array.isArray(valueOrArray)) {
            const keys = ValueUtils.generateKeysForArray(valueOrArray, key)
            result.where.push(`${field} IN(${keys.map(key => `:${key}`).join(',')})`)
            for (let i = 0; i < valueOrArray.length; i++) {
                result.params[keys[i]] = valueOrArray[i]
            }
        } else {
            result.where.push(`${field} = :${key}`)
            result.params[key] = valueOrArray
        }
        return result
    }

    private static buildQueryValues(
        startWhere: string[],
        startParams: IDictionary<TDatabaseQueryInput>,
        valueOrArray: TDatabaseQueryInput | TDatabaseQueryInput[],
        fieldAndKey: string,
        parent_id?: number
    ): IDatabaseQueryKeys {
        const fromKey = this.buildKeys(valueOrArray, fieldAndKey, fieldAndKey)
        const where = [...startWhere, ...fromKey.where]
        const params = {...startParams, ...fromKey.params}
        if (parent_id !== undefined) {
            where.push('parent_id = :parent_id')
            params['parent_id'] = parent_id
        }
        return {where, params}
    }

    // endregion
    // region Load
    static loadByGroupAndKey(
        group_class: string,
        group_key: string | string[]
    ): IJsonStore[] | undefined {
        const queryValues = this.buildQueryValues(
            ['group_class = :group_class'],
            {group_class},
            group_key,
            'group_key'
        )
        const query = `SELECT *
                       FROM json_store
                       WHERE ${queryValues.where.join(' AND ')};`
        return this.#do.queryAll({query, params: queryValues.params})
    }

    static loadByRowId(
        row_id: number | number[],
        parent_id?: number
    ): IJsonStore[] | undefined {
        const queryValues = this.buildQueryValues(
            [],
            {},
            row_id,
            'row_id',
            parent_id
        )
        const query = `SELECT *
                       FROM json_store
                       WHERE ${queryValues.where.join(' AND ')};`
        return this.#do.queryAll({query, params: queryValues.params})
    }

    // // TODO: Possibly respect wildcards in incoming string, and do not add it by default?
    // static loadJsonByGroupMatch(groupPrefix: string, parent_id?: number): IJsonStore[] | undefined {
    //     const db = DatabaseSingleton.get(this.isTesting)
    //
    //     return db.queryAll({query, params})
    // }

    // endregion
    // region Save
    /**
     * Will insert or update an entry, matching either the group values or a specific row ID.
     * @param input
     */
    static save(
        input: IJsonStoreInput
    ): number {
        let result: number | object | undefined
        if (typeof input.row_id === 'number') {
            // Update
            result = this.#do.queryValue({
                query: `
                    UPDATE json_store
                    SET group_class = :group_class,
                        group_key   = :group_key,
                        parent_id   = :parent_id,
                        json_text   = :json_text
                    WHERE row_id = :row_id
                    RETURNING row_id;
                `,
                params: input
            })
        } else {
            // Upsert
            delete input.row_id // Ensure it is not included even as undefined.
            result = this.#do.queryValue({
                query: `
                    INSERT INTO json_store (group_class, group_key, parent_id, json_text)
                    VALUES (:group_class, :group_key, :parent_id, :json_text)
                    ON CONFLICT DO UPDATE SET parent_id=:parent_id,
                                              json_text=:json_text
                    RETURNING row_id;
                `,
                params: input
            })
        }
        return typeof result === 'number' ? result : -1
    }

    // endregion
    // region Delete
    /**
     * Will delete single entry, returns how many items were deleted.
     * @param group_class
     * @param group_key
     * @param parent_id
     */
    static deleteByGroupAndKey(
        group_class: string,
        group_key: string | string[],
        parent_id?: number
    ): number {
        const queryValues = this.buildQueryValues(
            ['group_class = :group_class'],
            {group_class},
            group_key,
            'group_key',
            parent_id
        )
        const query = `DELETE
                       FROM json_store
                       WHERE ${queryValues.where.join(' AND ')};`
        const result = this.#do.queryRun({query, params: queryValues.params})
        return typeof result === 'number' ? result : -1
    }

    static deleteByRowId(
        row_id: number | number[],
        parent_id?: number
    ): number {
        const queryValues = this.buildQueryValues(
            [],
            {},
            row_id,
            'row_id',
            parent_id
        )
        const query = `DELETE
                       FROM json_store
                       WHERE ${queryValues.where.join(' AND ')};`
        const result = this.#do.queryRun({query, params: queryValues.params})
        return typeof result === 'number' ? result : -1
    }

    static deleteAll(): boolean {
        if (this.isTesting) {
            return !!this.#do.queryRun({query: 'DELETE FROM json_store WHERE 1;'})
        } else {
            Log.w(this.#tag, 'Blocked attempt to delete all data as we are not testing.')
            return false
        }
    }

    // endregion
    // endregion

    // region Convenience Actions
    /** Will load one item as well as all items referenced inside that item, propagating recursively. */
    static loadWithChildrenByGroupAndKey(
        group_class: string,
        group_key: string
    ): IDictionary<IJsonStoreDecoded> {
        const rootItem = this.loadByGroupAndKey(group_class, group_key)?.pop()
        if (rootItem === undefined) return {}
        return this.#recursiveItemLoader(rootItem)
    }

    /** Will load one item as well as all items referenced inside that item, propagating recursively. */
    static loadWithChildrenByRowId(
        row_id: number,
        parent_id?: number
    ): IDictionary<IJsonStoreDecoded> {
        const rootItem = this.loadByRowId(row_id, parent_id)?.pop()
        if (rootItem === undefined) return {}
        return this.#recursiveItemLoader(rootItem)
    }

    /**
     * Will grab all reference IDs from the root item, load missing items from those, and return all the result including the root item.
     * @param rootItem
     * @param loadedIds Will prevent these IDs from loading again.
     * @private
     */
    static #recursiveItemLoader(
        rootItem: IJsonStore,
        loadedIds: number[] = []
    ): IDictionary<IJsonStoreDecoded> {
        const itemMeta = ItemMap.get(rootItem.group_class)
        if (itemMeta === undefined) return {}

        const jsonObj = ValueUtils.safeJsonParse<TSerializableParsedInput>(rootItem.json_text)
        if (jsonObj === undefined) return {}

        const childrenIds: number[] = []
        for (const itemProp of itemMeta.fieldTypes?.items ?? []) {
            const itemValue = jsonObj[itemProp]
            // Multiple item ids
            if (Array.isArray(itemValue)) childrenIds.push(
                ...itemValue.map(iv => ValueUtils.ensureNumber(iv))
            )
            // Single item id
            else childrenIds.push(ValueUtils.ensureNumber(itemValue))
        }

        let result: IDictionary<IJsonStoreDecoded> = {[`id_${rootItem.row_id}`]: {jsonObj, jsonStore: rootItem}}
        const children = this.loadByRowId(
            childrenIds.filter(id => !loadedIds.includes(id))
        ) ?? []
        for (const child of children) {
            const newChildren = this.#recursiveItemLoader(child, [...loadedIds, ...childrenIds])
            result = {...result, ...newChildren}
        }
        return result
    }
}