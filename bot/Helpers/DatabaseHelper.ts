import {IDictionary} from '../../lib/SharedUtils/Dictionary.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import {IJsonStore, IJsonStoreInput, TDatabaseQueryInput} from '../../lib/Types/Database.ts'
import DatabaseSingleton from '../Singletons/DatabaseSingleton.ts'

export interface IDatabaseHelperLoadOptions {
    group_class?: string,
    group_key?: string,
    parent_id?: number,
    row_id?: number | string
}

export default class DatabaseHelper {
    static readonly #tag = this.name
    static readonly OBJECT_MAIN_KEY: string = 'Main'
    static isTesting: boolean = false

    static testConnection(): boolean {
        return DatabaseSingleton.get(this.isTesting).test()
    }

    static closeConnection() {
        return DatabaseSingleton.get(this.isTesting).kill()
    }

    // region Json Store
    // region Load
    private static buildLoadJsonQueryAndParams(params: IDictionary<TDatabaseQueryInput>): [string, IDictionary<TDatabaseQueryInput>] {
        ValueUtils.removeUndefined(params)
        const where = Object.entries(params)
            .map(([key, value]) => {
                if (typeof value === 'string' && value.endsWith('%')) return `${key} LIKE :${key}` // Wildcard search
                else return `${key} = :${key}` // Absolute match
            })
            .join(' AND ')
        const query = `SELECT *
                       FROM json_store
                       WHERE ${where};`
        return [query, params]
    }

    static loadJsonByGroup(group_class: string, group_key: string, parent_id?: number): IJsonStore | undefined {
        const db = DatabaseSingleton.get(this.isTesting)
        const [query, params] = this.buildLoadJsonQueryAndParams({
            group_class: group_class,
            group_key: group_key,
            parent_id: parent_id
        })
        return db.queryGet({query, params})
    }

    static loadJsonByRowId(row_id: number, parent_id?: number): IJsonStore | undefined {
        const db = DatabaseSingleton.get(this.isTesting)
        const [query, params] = this.buildLoadJsonQueryAndParams({
            row_id: row_id,
            parent_id: parent_id
        })
        return db.queryGet({query, params})
    }

    static loadJsonByGroupMatch(groupPrefix: string, parent_id?: number): IJsonStore[] | undefined {
        const db = DatabaseSingleton.get(this.isTesting)
        const [query, params] = this.buildLoadJsonQueryAndParams({
            group_class: `${groupPrefix}%`,
            parent_id: parent_id
        })
        return db.queryAll({query, params})
    }

    // endregion
    // region Save
    /**
     * Will insert or update an entry, matching either the group values or a specific row ID.
     * @param input
     */
    static saveJson(input: IJsonStoreInput): number {
        const db = DatabaseSingleton.get(this.isTesting)
        let result: number | object | undefined
        if (typeof input.row_id === 'number') {
            // Update
            result = db.queryRun({
                query: `
                    UPDATE json_store
                    SET group_class = :group_class,
                        group_key   = :group_key,
                        parent_id   = :parent_id,
                        json_blob   = :json_blob
                    WHERE row_id = :row_id;
                `,
                params: input
            })
        } else {
            // Upsert
            result = db.queryRun({
                query: `
                    INSERT INTO json_store (group_class, group_key, parent_id, json_blob)
                    VALUES (:group_class, :group_key, :parent_id, :json_blob)
                    ON CONFLICT DO UPDATE SET parent_id=:parent_id,
                                              json_blob=:json_blob;
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
     */
    static deleteJsonByGroup(
        group_class: string,
        group_key: string
    ): number {
        const db = DatabaseSingleton.get(this.isTesting)
        const result = db.queryRun({
            query: 'DELETE FROM json_store WHERE group_class = :group_class AND group_key = :group_key;',
            params: {group_class, group_key}
        })
        return typeof result === 'number' ? result : -1
    }
    static deleteJsonById(
        row_id: number
    ): number {
        const db = DatabaseSingleton.get(this.isTesting)
        const result = db.queryRun({
            query: 'DELETE FROM json_store WHERE row_id = :row_id;',
            params: {row_id}
        })
        return typeof result === 'number' ? result : -1
    }

    // endregion
    // endregion
}