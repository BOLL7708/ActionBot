import {TItemParsed} from '../../../../Objects/AbstractItem.ts'
import {IDictionary} from '../../../../SharedUtils/Dictionary.ts'
import Serializable from '../../../../SharedUtils/Serializable.ts'

export type TDatabaseAction =
    | 'unknown'
    | 'load'
    | 'save'
    | 'delete'

export default class DatabaseRequest extends Serializable {
    action: TDatabaseAction = 'unknown' // Perform various actions
    messageId: string = '' // Identify the message
    groupClass?: string // Select from group
    groupKey?: string // Select on group key
    rowId?: number // Select on row ID
    parentId?: number // Filter on parent ID
    data: IDictionary<TItemParsed> = {} // Ingoing data, encoded
}