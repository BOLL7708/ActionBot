import {AbstractData} from '../Objects/Data/AbstractData.mts'

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