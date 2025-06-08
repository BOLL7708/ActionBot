import {AbstractData} from '../Objects/Data/AbstractData.ts'

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
    /**
     * The JavaScript class name that the JSON data represents.
     */
    class: string
    key: string
    pid: number|null
    /**
     * The JSON data instantiated as the referenced class.
     * This is the object to update to save changes to the DB.
     */
    data: (T&AbstractData)|null
    /**
     * The JSON data instantiated as the referenced class, with item references filled in.
     * This is a bonus property not from the DB, to be used at runtime.
     */
    filledData: (T&AbstractData)|null
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