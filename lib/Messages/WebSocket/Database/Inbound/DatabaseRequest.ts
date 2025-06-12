import Serializable from '../../../../SharedUtils/Serializable.ts'

export type TDatabaseAction =
    | 'unknown'
    | 'load'
    | 'save'
    | 'delete'

export default class DatabaseRequest extends Serializable {
    action: TDatabaseAction = 'unknown' // Perform various actions
    messageId: string = '' // Identify the message
    rowId: number = 0 // Select on row ID
    groupClass: string = '' // Select from group
    groupKey: string = '' // Select on group key
    parentId: number = 0 // Filter on parent ID
    dataJsonBase64: string = '' // Ingoing data, encoded
}