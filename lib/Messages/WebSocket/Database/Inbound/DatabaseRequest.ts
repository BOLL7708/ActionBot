import Serializable, {TSerializableParsedInput} from '../../../../SharedUtils/Serializable.ts'

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
    groupClass: string = '' // Select from group
    groupKey: string = '' // Select on group key
    rowId: number = 0 // Select on row ID
    parentId: number = 0 // Filter on parent ID

    // Item data
    data: TSerializableParsedInput = {} // Ingoing data
}