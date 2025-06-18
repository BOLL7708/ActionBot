export type TDatabaseQueryInput = null | undefined | number | bigint | string | boolean | Date | Uint8Array | [] | Record<PropertyKey, never>

/** The data entry that comes out of the database */
export interface IJsonStore extends IJsonStoreInput {
    row_id: number
    row_created: string
    row_modified: string
}

/**
 * Data entry to store in the database
 * 1. Set only `group_key` OR `parent_id`, leave the other as `null`.
 * 2. Set `row_id` to do an explicit update to that row.
 */
export interface IJsonStoreInput extends Record<string, TDatabaseQueryInput> {
    /** The class name of the object that was encoded */
    group_class: string
    /** This is mutually exclusive to parent_id */
    group_key: string|null
    /** This is mutually exclusive to group_key */
    parent_id: number|null
    /** Needs to be a valid JSON string */
    json_blob: string
    /** When set, will cause an explicit update. */
    row_id?: number
}