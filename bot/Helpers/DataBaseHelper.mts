import {AbstractData, DataMap} from '../../lib-shared/index.mts'
import Log from '../EasyTSUtils/Log.mts'
import {IDictionary, INumberDictionary, IStringDictionary} from '../Interfaces/igeneral.mts'
import DatabaseSingleton from '../Singletons/DatabaseSingleton.mts'
import Utils from '../Utils/Utils.mts'

export default class DataBaseHelper {
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
    private static _dataStore: Map<string, IDictionary<IDataBaseItem<any>>> = new Map() // Used for storing keyed entries in memory before saving to disk

    // Editor specific storage
    private static _idKeyLabelStore: Map<[string, number], IDataBaseListItems> = new Map() // Used to store ID reference lists used in the editor

    // Reference maps, if an object has been loaded once, it exists in these maps.
    private static _groupKeyTupleToMetaMap: Map<[string, string], IDataBaseItem<any>> = new Map()
    private static _idToMetaMap: Map<number, IDataBaseItem<any>> = new Map()

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
    ): IDataBaseItem<any>[]|undefined {
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
        if (!groupKey) groupKey = this.getUUID(groupClass) ?? null

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

    static search(searchQuery: string, surroundWithWildcards: boolean = true): IDataBaseItemRaw[] {
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
            const raw: IDataBaseItemRaw = {
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
    private static handleDataBaseItem<T>(item: IDataBaseItem<T>):T|undefined {
        const itemClone = Utils.clone<IDataBaseItem<T>>(item)
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
    ): IDictionary<IDataBaseItem<T>>|undefined {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'loadDictionary')) return undefined

        // Cache
        if(this._dataStore.has(className)) {
            return this._dataStore.get(className) as IDictionary<IDataBaseItem<T>>
        }

        // DB
        const jsonResult = this.loadJson(className) as IDataBaseItem<T>[]|undefined
        if(Array.isArray(jsonResult)) {
            const cacheDictionary: IDictionary<IDataBaseItem<T>> = {}

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

    static async loadOrEmpty<T>(
        emptyInstance: T&AbstractData,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): Promise<T> {
        // Filled can always be true as this is not used in the editor
        return await this.load(emptyInstance, key, parentId, true, ignoreCache) ?? emptyInstance
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
    ): IDataBaseItem<T>|undefined {
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
        const jsonResult = this.loadJson(className, key, parentId) as IDataBaseItem<T>[]|undefined
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
    ): IDataBaseItem<unknown>|undefined {
        if(!rowId) return undefined

        const result = this.loadJson(null, null, parentId, rowId)
        const item: IDataBaseItem<any>|undefined = result?.[0]
        if(item) {
            this.fillItemsInPlace(item.class, item.key, null, [item])
        }
        return item
    }

    private static fillItemsInPlace(
        className: string,
        key: string,
        emptyInstance: AbstractData|null,
        items: IDataBaseItem<any>[]
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
                const newDic: IDictionary<IDataBaseItem<any>> = {}
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
    static async loadClassesWithCounts(like: string): Promise<INumberDictionary> {
        const url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass: like+'*'})
        })
        return response.ok ? await response.json() : {}
    }

    /**
     * Load all available IDs for a group class registered in the database.
     */
    static async loadIDsWithLabelForClass(groupClass: string, rowIdLabel?: string, parentId?: number): Promise<IDataBaseListItems> {
        const tuple: [string, number] = [groupClass, parentId ?? 0]
        if(this._idKeyLabelStore.has(tuple)) return this._idKeyLabelStore.get(tuple) ?? {}

        const url = this.getUrl()
        const options: IDataBaseHelperHeaders = {
            groupClass,
            rowIdList: true,
            rowIdLabel,
            parentId
        }
        const response = await fetch(url, {
            headers: await this.getHeader(options)
        })
        const json = response.ok ? await response.json() : {}
        this._idKeyLabelStore.set(tuple, json)

        return json
    }

    /**
     * Loads raw JSON a group class and key, will use cache if that is set.
     */
    static async loadRawItem(groupClass: string, groupKey: string): Promise<IDataBaseItem<any>|undefined> {
        const tuple: [string, string] = [groupClass, groupKey]

        // Return cache if it is set
        if(this._groupKeyTupleToMetaMap.has(tuple)) {
            const cachedItem = this._groupKeyTupleToMetaMap.get(tuple)
            if(cachedItem) return cachedItem
        }

        // Load from DB
        const jsonResult = await this.loadJson(groupClass, groupKey, 0, null, true)
        if(jsonResult && jsonResult.length > 0) {
            const item = jsonResult[0]
            this.handleDataBaseItem(item).then() // Store cache
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
    static async loadIDClasses(idArr: string[]|number[]): Promise<IStringDictionary> {
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
            const url = this.getUrl()
            const response = await fetch(url, {
                headers: await this.getHeader({
                    rowIds: toLoad.join(','),
                    noData: true
                })
            })
            if(response.ok) {
                const jsonResult = await response.json()
                if(jsonResult && jsonResult.length > 0) {
                    for(const item of jsonResult) {
                        // this.handleDataBaseItem(item).then()
                        if(item) {
                            output[item.id] = item.class
                        }
                    }
                }
            }
        }
        return output
    }

    static async loadID(groupClass: string, groupKey: string): Promise<number> {
        const url = this.getUrl()
        const options: IDataBaseHelperHeaders = {
            groupClass: groupClass,
            groupKey: groupKey,
            onlyId: true
        }
        const response = await fetch(url, {
            headers: await this.getHeader(options)
        })
        const jsonResult = await response.json()
        return response.ok ? jsonResult.result : 0
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
            const _item = this.loadItem(setting, key, parentId, true) as IDataBaseItem<T>
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
    static outputEntries(entries: IDatabaseRow[]): IDataBaseItem<any>[] | undefined {
        let output: IDataBaseItem<any>[] | undefined = undefined
        if (Array.isArray(entries)) {
            output = []
            for (const row of entries) {
                const item: IDataBaseItem<any> = {
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

    private static getUUID(groupClass: string): string|undefined {
        const db = DatabaseSingleton.get()
        let notUniqueYet = true
        let groupKey: string|undefined
        while (notUniqueYet) {
            const hexResult = db.queryValue<string>({query: 'SELECT lower(hex(randomblob(18))) as hex;'}); // UUID() does not exist in Sqlite so this is a substitute.
        //     const groupKey = $hexResult[0]['hex'] ?? null;
        //     if ($groupKey === null) {
        //         error_log("UUID: Unable to get new hex for group_class: $groupClass");
        //         return null;
        //     }
        //     $countResult = $this->query(
        //        'SELECT COUNT(*) as count FROM json_store WHERE group_class = :group_class AND group_key = :group_key LIMIT 1;',
        //        [':group_class' => $groupClass, ':group_key' => $groupKey]
        // );
        //     $count = $countResult[0]['count'] ?? null;
        //     if ($count === null) {
        //         error_log("UUID: Unable to get count for group_class: $groupClass, group_key: $groupKey");
        //         return null;
        //     }
        //     $notUniqueYet = $count > 0;
            notUniqueYet = false
        }
        return groupKey
    }

    static getUrl() { return '' } // TODO: TEMPORARY TO ENABLE BUILDING

    /**
     * Get authorization header with optional JSON content type.
     * @param options
     * @private
     */
    private static getHeader(
        options: IDataBaseHelperHeaders
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

    static async getNextKey(groupClass: string, parentId: number, shorten: boolean): Promise<IDataBaseNextKeyItem|undefined> {
        const parent = await this.loadById(parentId)
        let tail = groupClass
        if(shorten) tail = Utils.splitOnCaps(groupClass).splice(1).join('')
        let newKey = `${parent?.key ?? 'New'} ${tail}`
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass, groupKey: newKey, nextGroupKey: true})
        })
        return response.ok ? await response.json() : undefined
    }
    // endregion
}

// region Interfaces
interface IDataBaseHelperHeaders {
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

export interface IDataBaseItem<T> {
    id: number
    class: string
    key: string
    pid: number|null
    data: (T&AbstractData)|null
    filledData: (T&AbstractData)|null // Bonus property not from the DB, it's the data property but with references filled in.
}
export interface IDataBaseItemRaw extends IDataBaseItem<any> {
    data: string
}
export interface IDataBaseListItems {
    [id: string]: IDataBaseListItem
}
export interface IDataBaseListItem {
    key: string
    label: string
    pid: number|null
}
export interface IDataBaseNextKeyItem {
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
// endregion