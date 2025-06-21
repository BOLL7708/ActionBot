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

export type TDatabaseQueryParam = string | string[] | number | number[] | undefined
export type TDatabaseQueryValue = string | number

export interface IDatabaseQueryKeys {
    where: string[]
    params: IDictionary<TDatabaseQueryInput>
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
    // region Utils
    /**
     *
     * @param valueOrArray The single value or array that the keys will be generated for.
     * @param field The field name in the database we are referencing.
     * @param key The key name that will be used when serializing, gets appended with the serial number.
     * @private
     */
    private static buildKeys(valueOrArray: TDatabaseQueryInput | TDatabaseQueryInput[], field: string, key: string = ''): IDatabaseQueryKeys {
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
    static loadJsonByGroup(group_class: string, group_key: string | string[]): IJsonStore[] | undefined {
        const db = DatabaseSingleton.get(this.isTesting)
        const queryValues = this.buildQueryValues(
            ['group_class = :group_class'],
            {group_class},
            group_key,
            'group_key'
        )
        const query = `SELECT *
                       FROM json_store
                       WHERE ${queryValues.where.join(' AND ')};`
        return db.queryAll({query, params: queryValues.params})
    }

    static loadJsonByRowId(row_id: number | number[], parent_id?: number): IJsonStore[] | undefined {
        const db = DatabaseSingleton.get(this.isTesting)
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
        return db.queryAll({query, params: queryValues.params})
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
    static saveJson(input: IJsonStoreInput): number {
        const db = DatabaseSingleton.get(this.isTesting)
        let result: number | object | undefined
        if (typeof input.row_id === 'number') {
            // Update
            result = db.queryValue({
                query: `
                    UPDATE json_store
                    SET group_class = :group_class,
                        group_key   = :group_key,
                        parent_id   = :parent_id,
                        json_blob   = :json_blob
                    WHERE row_id = :row_id
                    RETURNING row_id;
                `,
                params: input
            })
        } else {
            // Upsert
            result = db.queryValue({
                query: `
                    INSERT INTO json_store (group_class, group_key, parent_id, json_blob)
                    VALUES (:group_class, :group_key, :parent_id, :json_blob)
                    ON CONFLICT DO UPDATE SET parent_id=:parent_id,
                                              json_blob=:json_blob
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
    static deleteJsonByGroup(
        group_class: string,
        group_key: string | string[],
        parent_id?: number
    ): number {
        const db = DatabaseSingleton.get(this.isTesting)
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
        const result = db.queryRun({query, params: queryValues.params})
        return typeof result === 'number' ? result : -1
    }

    static deleteJsonById(
        row_id: number | number[],
        parent_id?: number
    ): number {
        const db = DatabaseSingleton.get(this.isTesting)
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
        const result = db.queryRun({query, params: queryValues.params})
        return typeof result === 'number' ? result : -1
    }

    // endregion
    // endregion
}