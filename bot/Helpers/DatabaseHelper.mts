import {AbstractData, DataMap} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mts'
import {IDictionary, INumberDictionary, IStringDictionary} from '../../lib/Types/Dictionary.mts'
import DatabaseSingleton, {TDatabaseQueryInput} from '../Singletons/DatabaseSingleton.mts'
import Utils from '../Utils/Utils.mts'

export default class DatabaseHelper {
    private static readonly TAG = this.name
    static readonly OBJECT_MAIN_KEY: string = 'Main'
    static isTesting: boolean = false

    /*
    TODO
     In the future transition to having the data store being a big list referenced by row ID.
     Then save separate indices:
        1. ID to class and key
        2. Class to IDs
    */

    // Main storage
    private static _dataStore: Map<string, IDictionary<IDatabaseItem<any>>> = new Map() // Used for storing keyed entries in memory before saving to disk

    // Editor specific storage
    private static _idKeyLabelStore: Map<[string, number], IDictionary<IDatabaseListItem>> = new Map() // Used to store ID reference lists used in the editor

    // Reference maps, if an object has been loaded once, it exists in these maps.
    private static _groupKeyTupleToMetaMap: Map<[string, string], IDatabaseItem<any>> = new Map()
    private static _idToMetaMap: Map<number, IDatabaseItem<any>> = new Map()

    static testConnection(): boolean {
        return DatabaseSingleton.get(this.isTesting).test()
    }
    static closeConnection() {
        return DatabaseSingleton.get(this.isTesting).kill()
    }

    private static getFieldsString(withData: boolean = true): string {
        const fields = ['row_id', 'group_class', 'group_key', 'parent_id']
        if (withData) fields.push('data_json')
        return fields.join(',')
    }

    // region Json Store
    static loadJson(
        groupClass: string|null = null,
        groupKey: string|null = null,
        parentId: number|null = null,
        rowId: number|string|null = null,
        noData: boolean = false
    ): IDatabaseItem<any>[]|undefined {
        const db = DatabaseSingleton.get(this.isTesting)
        const fieldsStr = this.getFieldsString(!noData)

        const params: IDictionary<any> = {}
        if (groupClass !== null) {
            params.group_class = groupClass
        }
        if (groupKey !== null) {
            params.group_key = groupKey
        }
        if (parentId !== null) {
            params.parent_id = parentId
        }
        if (rowId !== null) {
            params.row_id = rowId
        }
        const where = Object.keys(params).map((p)=>{return `${p} = :${p}`}).join(' AND ')
        let query = `SELECT ${fieldsStr} FROM json_store WHERE ${where};`

        const result = db.queryAll({query,params})
        return this.outputEntries(result ?? [])
    }

    /**
     * Save to database
     * @param jsonStr Data to store.
     * @param groupClass Main category to load.
     * @param groupKey Specific item to fetch.
     * @param newGroupKey New key to replace old with.
     * @param parentId Optional ID for a parent row.
     */
    static saveJson(
        jsonStr: string,
        groupClass: string,
        groupKey: string|null = null,
        newGroupKey: string|null = null,
        parentId: number|null = null
    ): string|undefined {
        const db = DatabaseSingleton.get(this.isTesting)

        // EDIT the key for an already existing post if the new key is not already used
        if(groupKey !== null && newGroupKey !== null && groupKey !== newGroupKey) {
            const newKeyAlreadyExists = !!db.queryValue<string>({
                query: 'SELECT group_key FROM json_store WHERE group_class = :group_class AND group_key = :group_key LIMIT 1;',
                params: {group_class: groupClass, group_key: newGroupKey}
            })
            let keyUpdated = false
            if(!newKeyAlreadyExists) keyUpdated = !!db.queryRun({
                query: 'UPDATE json_store SET group_key = :new_group_key WHERE group_class = :group_class AND group_key = :old_group_key;',
                params: {new_group_key: newGroupKey, group_class: groupClass, old_group_key: groupKey}
            })
            if(keyUpdated) groupKey = newGroupKey
        }

        // A new key was provided without an original key, we apply this before saving.
        // TODO: Cannot actually remember why this would happen...
        if(groupKey === null && newGroupKey !== null) {
            groupKey = newGroupKey
        }

        // Unset parent ID if it is invalid
        if(typeof parentId !== 'number' || isNaN(parentId)) {
            parentId = null
        }

        // If key is still missing, generate one
        if (!groupKey) groupKey = this.getUuid(groupClass) ?? null

        // Upsert
        const result = db.queryRun({
           query: "INSERT INTO json_store (group_class, group_key, parent_id, data_json) VALUES (:group_class, :group_key, :parent_id, :data_json) ON CONFLICT DO UPDATE SET parent_id=:parent_id, data_json=:data_json;",
           params: {group_class: groupClass, group_key: groupKey, parent_id: parentId, data_json: jsonStr}
        })
        if(!result) groupKey = null

        // Load item and update caches
        if(groupKey) {
            const newItem = this.loadJson(groupClass, groupKey, parentId, null, true)

            if(newItem?.length) {
                this.handleDataBaseItem(newItem[0])
            }
        }
        return result && groupKey !== null ? groupKey : undefined
    }

    /**
     * Will delete single entry, returns how many items were deleted.
     * @param groupClass
     * @param groupKey
     */
    static deleteJson(
       groupClass: string,
       groupKey: string
    ): number {
        const db = DatabaseSingleton.get(this.isTesting)
        const result = db.queryRun({
            query: "DELETE FROM json_store WHERE group_class = :group_class AND group_key = :group_key;",
            params: {group_class: groupClass, group_key: groupKey}
        })
        return typeof result === 'number' ? result : -1
    }

    /**
     * Delete a category, this is a special action for the editor, and TODO: might be unused.
     * @param categoryId
     */
    static deleteCategoryJson(categoryId: number): number {
        const db = DatabaseSingleton.get(this.isTesting)
        const result = db.queryRun({
            query: `DELETE FROM json_store WHERE JSON_EXTRACT(data_json, '$.category') = :category;`,
            params: {category: categoryId},
        })
        return typeof result === 'number' ? result : -1
    }

    static search(searchQuery: string, surroundWithWildcards: boolean = true): IDatabaseItemRaw[] {
        const pattern = searchQuery
           .replace(/\*/g, '?')
           .replace(/%/g, '_')
        const db = DatabaseSingleton.get(this.isTesting)
        const output = db.queryAll({
            query: 'SELECT row_id, group_class, group_key, parent_id, data_json FROM json_store WHERE LOWER(group_key) LIKE LOWER(:like_group_key) OR LOWER(data_json) LIKE LOWER(:like_data_json);',
            params: {like_group_key: pattern, like_data_json: pattern},
        })
        if(!Array.isArray(output)) return []

        return output.map((row) => {
            const raw: IDatabaseItemRaw = {
                id: row.row_id,
                class: row.group_class,
                key: row.group_key,
                pid: row.parent_id,
                data: row.data_json,
                filledData: null
            }
            return raw
        })
    }
    // endregion

    // region Instance Functions

    /**
     * Register the meta in maps and return a cast object in case data is available.
     * @param item
     * @private
     */
    private static handleDataBaseItem<T>(item: IDatabaseItem<T>):T|undefined {
        const itemClone = ValueUtils.clone<IDatabaseItem<T>>(item)
        itemClone.data = null

        // We cache things so we can quickly list them later, thus data is nulled.
        this._idToMetaMap.set(item.id, itemClone)
        this._groupKeyTupleToMetaMap.set([item.class, item.key], itemClone)

        // Add filled version
        const meta = DataMap.getMeta(item.class)
        if(meta) {
            item.filledData = meta.instance.__new(item.data ?? undefined, true)
            item.data = meta.instance.__new(item.data ?? undefined, false)
        }

        return item.data ? item.data as T : undefined
    }

    /**
     * Load a dictionary of entries from the database, this will retain keys.
     * @param emptyInstance Instance of the class to load.
     * @param parentId Filter on items with this parent id.
     */
    static loadAll<T>(
        emptyInstance: T&AbstractData,
        parentId?: number,
    ): IDictionary<IDatabaseItem<T>>|undefined {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'loadDictionary')) return undefined

        // Cache
        if(this._dataStore.has(className)) {
            return this._dataStore.get(className) as IDictionary<IDatabaseItem<T>>
        }

        // DB
        const jsonResult = this.loadJson(className) as IDatabaseItem<T>[]|undefined
        if(Array.isArray(jsonResult)) {
            const cacheDictionary: IDictionary<IDatabaseItem<T>> = {}

            // Convert plain objects to class instances and cache them
            for(const item of jsonResult) {
                const filledObject = emptyInstance.__new(item.data ?? undefined, true)
                if(filledObject) {
                    item.filledData = filledObject
                    item.data = emptyInstance.__new(item.data ?? undefined, false)
                    cacheDictionary[item.key] = item
                }
            }
            this._dataStore.set(className, cacheDictionary)
            return cacheDictionary
        }
        return undefined
    }

    /**
     * Load a main blob from the database, or cache if it exists.
     * @param emptyInstance Instance of the class to load.
     * @param filled
     */
    static loadMain<T>(
        emptyInstance: T&AbstractData,
        filled: boolean = true
    ): T {
        return this.load(emptyInstance, this.OBJECT_MAIN_KEY, undefined, filled) ?? emptyInstance
    }

    /**
     * The original load function that now loads the full item but returns only the data.
     * @param emptyInstance
     * @param key
     * @param parentId
     * @param filled
     * @param ignoreCache
     */
    static load<T>(
        emptyInstance: T&AbstractData,
        key: string,
        parentId?: number,
        filled?: boolean,
        ignoreCache?: boolean
    ): T|undefined {
        const item = this.loadItem(emptyInstance, key, parentId, ignoreCache)
        if(item) {
            return filled ? item.filledData as T : item.data as T
        }
        return undefined
    }

    static loadOrEmpty<T>(
        emptyInstance: T&AbstractData,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): T {
        // Filled can always be true as this is not used in the editor
        return this.load(emptyInstance, key, parentId, true, ignoreCache) ?? emptyInstance
    }

    /**
     * Load one specific blob from the database, or from the cache if it already exists.
     * @param emptyInstance Instance of the class to load.
     * @param key The key for the row to load.
     * @param parentId Only load the item if it has this parent id.
     * @param ignoreCache Used to load a fresh item after saving to update the cache.
     */
    static loadItem<T>(
        emptyInstance: T&AbstractData,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): IDatabaseItem<T>|undefined {
        const className = emptyInstance.constructor.name
        if (this.checkAndReportClassError(className, 'loadSingle')) return undefined

        // Check if cached, if so return that
        if(!ignoreCache && this._dataStore.has(className)) {
            const cache = this._dataStore.get(className)
            if(cache && cache.hasOwnProperty(key)) {
                return cache[key]
            }
        }

        // DB
        const jsonResult = this.loadJson(className, key, parentId) as IDatabaseItem<T>[]|undefined
        if(jsonResult && jsonResult.length == 1) {
            this.fillItemsInPlace(
                className,
                key,
                emptyInstance,
                jsonResult
            )
            return jsonResult[0]
        }
        return undefined
    }

    static loadById(
        rowId?: string|number,
        parentId?: number
    ): IDatabaseItem<unknown>|undefined {
        if(!rowId) return undefined

        const result = this.loadJson(null, null, parentId, rowId)
        const item: IDatabaseItem<any>|undefined = result?.[0]
        if(item) {
            this.fillItemsInPlace(item.class, item.key, null, [item])
        }
        return item
    }

    private static fillItemsInPlace(
        className: string,
        key: string,
        emptyInstance: AbstractData|null,
        items: IDatabaseItem<any>[]
    ): void {
        if(emptyInstance === null) {
            emptyInstance = DataMap.getInstance({ className, fill: false }) as AbstractData
        }
        for (const item of items) {
            // Convert plain object to class filled and unfilled instances
            item.filledData = emptyInstance.__new(item.data ?? undefined, true)
            item.data = emptyInstance.__new(item.data ?? undefined, false)

            // Ensure dictionary exists
            if (!this._dataStore.has(className)) {
                const newDic: IDictionary<IDatabaseItem<any>> = {}
                this._dataStore.set(className, newDic)
            }
            const cacheDictionary = this._dataStore.get(className)

            // Save cache
            if (cacheDictionary) cacheDictionary[key] = item
        }
    }

    /**
     * Load all available group classes registered in the database.
     */
    static loadClassesWithCounts(like?: string, parentId?: number): INumberDictionary {
        const db = DatabaseSingleton.get()

        const whereArr: string[] = []
        const params: IDictionary<TDatabaseQueryInput> = {}
        if (like && like.length) {
            params['group_class'] = like.replaceAll('*', '%')
            whereArr.push('group_class LIKE :group_class')
        }
        if (parentId) {
            params['parent_id'] = parentId
            whereArr.push('parent_id LIKE :parent_id')
        }
        const where = 'WHERE ' + whereArr.join(' AND ')

        const query = `SELECT group_class, COUNT(*) count
                       FROM json_store ${where}
                       GROUP BY group_class;`
        const result = db.queryDictionary<{ group_class: string, count: number }>({query, params})
        if (!result) return {}
        return Object.fromEntries(
            Object.entries(result).map(
                ([key, data]) => [data.group_class, data.count]
            )
        )
    }

    /**
     * Load all available IDs for a group class registered in the database.
     */
    static loadIdsWithLabelForClass(groupClass: string, rowIdLabel?: string, parentId?: number): IDictionary<IDatabaseListItem> {
        const tuple: [string, number] = [groupClass, parentId ?? 0]
        if(this._idKeyLabelStore.has(tuple)) return this._idKeyLabelStore.get(tuple) ?? {}

        const db = DatabaseSingleton.get(this.isTesting)

        let where = 'WHERE group_class LIKE :group_class'
        const params: IDictionary<TDatabaseQueryInput> = {'group_class': groupClass.replace(/\*/g, '%')}

        if (parentId) {
            where += ' AND (parent_id = :parent_id OR parent_id IS NULL)';
            params['parent_id'] = parentId
        }
        let result: IDictionary<IDatabaseListItem>|undefined
        if (rowIdLabel && rowIdLabel.length > 0) {
            params['json_extract'] = `$.${rowIdLabel}`
            const query = `SELECT row_id as id, group_key as \`key\`, json_extract(data_json, :json_extract) as label, parent_id as pid FROM json_store ${where};`
            result = db.queryDictionary<IDatabaseListItem>({query, params})
        } else {
            const query = `SELECT row_id as id, group_key as \`key\`, '' as label, parent_id as pid FROM json_store ${where};`
            result = db.queryDictionary<IDatabaseListItem>( {query, params});
        }
        if(result) {
            result = Object.fromEntries(
                Object.values(result)
                    .map((item)=> {
                        const id = item.id
                        delete item.id
                        return [id, item]
                    })
            )
            if(result) this._idKeyLabelStore.set(tuple, result)
        }
        return result ?? {}
    }

    /**
     * Loads raw JSON a group class and key, will use cache if that is set.
     */
    static async loadRawItem(groupClass: string, groupKey: string): Promise<IDatabaseItem<any>|undefined> {
        const tuple: [string, string] = [groupClass, groupKey]

        // Return cache if it is set
        if(this._groupKeyTupleToMetaMap.has(tuple)) {
            const cachedItem = this._groupKeyTupleToMetaMap.get(tuple)
            if(cachedItem) return cachedItem
        }

        // Load from DB
        const jsonResult = this.loadJson(groupClass, groupKey, 0, null, true)
        if(jsonResult && jsonResult.length > 0) {
            const item = jsonResult[0]
            this.handleDataBaseItem<any>(item).then() // Store cache
            return item
        }
        return undefined
    }

    /**
     * Clears the cache of IDs loaded for a class or all classes so they will be reloaded, to show recent additions or deletions.
     * @param groupClass
     * @param parentId
     */
    static clearReferences(groupClass?: string, parentId?: number): boolean {
        if(groupClass) {
            this._idKeyLabelStore.delete([groupClass, parentId ?? 0])
            return true
        }
        return false
    }

    /**
     * Used to get which classes a reference list of IDs has in the editor.
     * @param idArr
     */
    static loadIdClasses(idArr: string[]|number[]): IStringDictionary {
        const output: IStringDictionary = {}
        const toLoad: string[] = []
        for(const idVal of idArr) {
            const id = typeof idVal === 'string' ? parseInt(idVal) : idVal
            if(this._idToMetaMap.has(id)) {
                const item = this._idToMetaMap.get(id)
                output[id] = item?.class ?? ''
            } else {
                toLoad.push(id.toString())
            }
        }
        if(toLoad.length > 0) {
            const db = DatabaseSingleton.get(this.isTesting)
            const query = `SELECT row_id, group_class FROM json_store WHERE row_id IN :row_ids;`
            const params: IDictionary<TDatabaseQueryInput> = {row_ids: toLoad}
            const result = db.queryDictionary<IDatabaseClassItem>({query, params})
            if(result) {
                for(const row of Object.values(result)) {
                    output[`${row.row_id}`] = row.group_class
                }
            }
        }
        return output
    }

    static loadId(groupClass: string, groupKey: string): number {
        const db = DatabaseSingleton.get(this.isTesting)
        const query = `SELECT row_id AS id FROM json_store WHERE group_class = :group_class AND group_key = :group_key LIMIT 1;`
        const params = {group_class: groupClass, group_key: groupKey}
        const result = db.queryValue<number>({query, params})
        return result ?? 0
    }

    /**
     * Save a setting to the database.
     * @param setting Instance of the class to save.
     * @param key Optional key for the setting to save, will upsert if key is set, else insert.
     * @param newKey
     * @param parentId
     */
    static save<T>(setting: T&AbstractData, key?: string, newKey?: string, parentId?: number): string|undefined {
        const className = setting.constructor.name
        if(this.checkAndReportClassError(className, 'saveSingle')) return undefined

        // DB
        key = this.saveJson(JSON.stringify(setting), className, key, newKey, parentId)
        Log.v(this.TAG, `Key from saving`, key)

        // Update cache
        if(key) {
            // Loading an item here while ignoring the cache will also update the cache.
            const _item = this.loadItem(setting, key, parentId, true) as IDatabaseItem<T>
        }

        // Result
        if(key) Log.i(this.TAG, `Wrote '${className}' with key '${key}' to DB`)
        else Log.e(this.TAG, `Failed to write '${className}' with key '${key}' to DB`)
        return key
    }

    static saveMain<T>(setting: T&AbstractData, parentId?: number): string|undefined {
        return this.save(setting, this.OBJECT_MAIN_KEY, undefined, parentId)
    }

    /**
     * Delete specific setting
     * @param emptyInstance Instance of the class to delete.
     * @param key The key for the row to delete. // TODO: Could do this optional to delete a whole group, but that is scary... wait with adding until we need it.
     */
    static delete<T>(emptyInstance: T&AbstractData|string, key: string): boolean {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'deleteSingle')) return false

        // DB
        const ok = this.deleteJson(className, key) >= 0

        // Clear cache
        if(ok) {
            const dictionary = this._dataStore.get(className)
            if(dictionary) delete dictionary[key]
            const tuple: [string, string] = [className, key]
            const id = this._groupKeyTupleToMetaMap.get(tuple)?.id ?? 0
            this._idToMetaMap.delete(id)
            this._groupKeyTupleToMetaMap.delete(tuple)
        }

        // Result
        if(ok) Log.i(this.TAG, 'Deleted this from DB:', className, key)
        else Log.e('Failed to delete this from DB:', className, key)
        return ok
    }

    /**
     * Delete whole category (of events)
     * @param categoryId the ID for the category to delete.
     */
    static deleteCategory<T>(categoryId: number): boolean {
        // DB
        const ok = this.deleteCategoryJson(categoryId) >= 0

        // Clear cache
        if(ok) {
            this._dataStore.clear()
            this._idToMetaMap.clear()
            this._groupKeyTupleToMetaMap.clear()
        }

        // Result
        if(ok) Log.i(this.TAG, 'Deleted all entries from DB with category:', categoryId)
        else Log.e(this.TAG, 'Failed to delete all entries from DB with category:', categoryId)
        return ok
    }
    // endregion

    // region Helpers

    /**
     * Load entries from the DB and return a list if they exist.
     * @param entries
     */
    static outputEntries(entries: IDatabaseRow[]): IDatabaseItem<any>[] | undefined {
        let output: IDatabaseItem<any>[] | undefined = undefined
        if (Array.isArray(entries)) {
            output = []
            for (const row of entries) {
                const item: IDatabaseItem<any> = {
                    key: row.group_key,
                    class: row.group_class,
                    id: row.row_id,
                    pid: row.parent_id,
                    data: this.tryParseJson(row.data_json),
                    filledData: null
                }
                output.push(item)
            }
        }
        return output
    }

    /**
     * Safe JSON parser that won't throw exceptions.
     * @param text
     * @private
     */
    private static tryParseJson(text: string): any|null {
        try {
            return JSON.parse(text)
        } catch (e) {
            return null
        }
    }

    private static getUuid(groupClass: string): string|undefined {
        const db = DatabaseSingleton.get()
        let notUniqueYet = true
        let groupKey: string|undefined
        while (notUniqueYet) {
            // UUID() does not exist in Sqlite so this is a substitute.
            const hexResult = db.queryValue<string>({query: 'SELECT lower(hex(randomblob(18))) as hex;'});
            if(!hexResult) return undefined
            const id = this.loadId(groupClass, hexResult)
            if(id === 0) notUniqueYet = false
        }
        return groupKey
    }

    /**
     * Get authorization header with optional JSON content type.
     * @param options
     * @private
     */
    private static getHeader(
        options: IDatabaseHelperHeaders
    ): HeadersInit {
        const headers = new Headers()
        // TODO: Auth will break here, but we can do the initial DB implementation unauthed
        // headers.set('Authorization', localStorage.getItem(Constants.LOCAL_STORAGE_KEY_AUTH+Utils.getCurrentPath()) ?? '')
        if(options.groupClass !== undefined) headers.set('X-Group-Class', options.groupClass)
        if(options.groupKey !== undefined) headers.set('X-Group-Key', options.groupKey)
        if(options.newGroupKey !== undefined) headers.set('X-New-Group-Key', options.newGroupKey)
        if(options.addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        if(options.rowIds !== undefined) headers.set('X-Row-Ids', options.rowIds.toString())
        if(options.rowIdList !== undefined) headers.set('X-Row-Id-List', options.rowIdList ? '1' : '0')
        if(options.rowIdLabel !== undefined) headers.set('X-Row-Id-Label', options.rowIdLabel)
        if(options.noData !== undefined) headers.set('X-No-Data', options.noData ? '1' : '0')
        if(options.parentId !== undefined) headers.set('X-Parent-Id', options.parentId.toString())
        if(options.searchQuery !== undefined) headers.set('X-Search-Query', options.searchQuery)
        if(options.nextGroupKey !== undefined) headers.set('X-Next-Group-Key', options.nextGroupKey ? '1' : '0')
        if(options.onlyId !== undefined) headers.set('X-Only-Id', options.onlyId ? '1' : '0')
        if(options.categoryId !== undefined) headers.set('X-Delete-Category', options.categoryId.toString())
        return headers
    }

    private static checkAndReportClassError(className: string, action: string): boolean {
        // TODO: Add callstack?
        const isProblem = className == 'Object'
        if(isProblem) {
            Log.w(this.TAG, `DB: "${action}" got class "${className}" which is invalid.`)
        }
        if(!DataMap.hasInstance(className)) {
            Log.w(this.TAG, `DB: "${action}" got class "${className}" which does not exist in the DataObjectMap! Is it added to RegisterObjects?`)
        }
        return isProblem
    }

    static getNextKey(groupClass: string, parentId: number, shorten: boolean): IDatabaseNextKeyItem|undefined {
        const parent = this.loadById(parentId)
        let tail = groupClass
        if(shorten) tail = Utils.splitOnCaps(groupClass).splice(1).join('')
        let newKey = `${parent?.key ?? 'New'} ${tail}`

        const query = 'SELECT group_key AS `key` FROM json_store WHERE group_class = :group_class AND (group_key LIKE :group_key OR json_store.group_key LIKE :like_group_key);'
        const params = {group_class: groupClass, group_key: newKey, like_group_key: `${newKey} %`}
        const db = DatabaseSingleton.get(this.isTesting)
        const result = db.queryValues<string>({query, params})

        let output: string|undefined = newKey
        if (result?.length) {
            let maxSerial = 0
            const keyLength = newKey.length
            for(const key of result) {
                if(key == newKey) {
                    output = undefined
                } else {
                    const tail = key.substring(keyLength)
                    const serial = parseInt(tail)
                    if(!isNaN(serial) && serial > maxSerial) maxSerial = serial
                }
            }
            if (output === undefined) {
                const newSerial = maxSerial + 1
                output = `${newKey} ${newSerial}`
            }
        }
        return {key: output}
    }
    // endregion
}

// region Interfaces
interface IDatabaseHelperHeaders {
    groupClass?: string
    groupKey?: string
    newGroupKey?: string
    rowIds?: number|string
    rowIdList?: boolean
    rowIdLabel?: string
    noData?: boolean
    addJsonHeader?: boolean
    parentId?: number
    searchQuery?: string
    nextGroupKey?: boolean
    onlyId?: boolean
    categoryId?: number
}

export interface IDatabaseItem<T> {
    id: number
    class: string
    key: string
    pid: number|null
    data: (T&AbstractData)|null
    filledData: (T&AbstractData)|null // Bonus property not from the DB, it's the data property but with references filled in.
}
export interface IDatabaseItemRaw extends IDatabaseItem<any> {
    data: string
}
export interface IDatabaseListItem {
    id?: number
    key: string
    label: string
    pid: number|null
}
export interface IDatabaseNextKeyItem {
    key: string
}

export interface IDatabaseRow {
    row_id: number
    row_created: string
    row_modified: string
    group_class: string
    group_key: string
    parent_id: number|null
    data_json: string
}

export interface IDatabaseClassItem {
    row_id: number
    group_class: string
}
// endregion