import {TItemParsed} from '../../../../Objects/AbstractItem.ts'
import {IDictionary} from '../../../../SharedUtils/Dictionary.ts'
import Serializable from '../../../../SharedUtils/Serializable.ts'

export type TDatabaseAction =
    | 'unknown'
    | 'load'
    | 'save'
    | 'delete'
    // TODO: Add more as is needed, like listing various things.

export default class DatabaseRequest extends Serializable {
    // Meta
    action: TDatabaseAction = 'unknown' // Perform various actions
    messageId: string = '' // Identify the message

    // Item selection
    groupClass?: string // Select from group
    groupKey?: string // Select on group key
    rowId?: number // Select on row ID
    parentId?: number // Filter on parent ID

    // Item data
    data: TItemParsed = {} // Ingoing data
}