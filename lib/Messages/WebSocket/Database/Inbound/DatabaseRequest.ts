import Serializable, {TSerializableParsedInput} from '../../../../SharedUtils/Serializable.ts'

export type TDatabaseAction =
    | 'unknown'
    | 'load'
    | 'save'
    | 'delete'
// TODO: Add more as is needed, like listing various things.

/**
 * The message to send to the bot to perform database tasks.
 *
 * 1. Choose what to perform using action
 * 2. Select with groupClass + groupKey | rowId
 * 3. Store with groupClass + groupKey | parentId, add rowId to force update
 * 4. Delete using rowId or rowIds
 */
export default class DatabaseRequest extends Serializable {
    // Meta
    /** Decides which action to perform on the database */
    action: TDatabaseAction = 'unknown'
    /** Automatically generated message ID to handle bidirectional communication */
    messageId: string = ''

    // Item selection
    /** Add with or filter on group class */
    groupClass: string = ''
    /** Add with or filter on group key, this is mutually exclusive with parent ID */
    groupKey: string = '' // Select on group key
    /** Select or delete by row ID */
    rowId: number = 0
    /** Delete by row IDs */
    rowIds: number[] = [] // Delete any number of IDs
    /** Add with or filter on parent ID, this is mutually exclusive with group key */
    parentId: number = 0 // Filter on parent ID

    // Item data
    /** Data that will be serialized and stored in the database */
    data: TSerializableParsedInput = {} // Ingoing data
}