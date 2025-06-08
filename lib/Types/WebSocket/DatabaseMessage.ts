import ValueUtils from '../../SharedUtils/ValueUtils.ts'

export type TDatabaseMessageAction =
    | 'unknown'
    | 'load'
    | 'save'
    | 'delete'

export interface IDatabaseMessage {
    action: TDatabaseMessageAction // Perform various actions
    nonce: string // Identify the message
    id?: number // Select on row ID
    key?: string // Select on group key
    group?: string // Select from group
    parentId?: number // Filter on parent ID
    data?: any // Resulting or ingoing data TODO: Transport it as JSON or decoded?
    // TODO: Add support here for more advanced stuff, OR, to not repeat the PHP coms make it different types of messages.
}

export class DatabaseMessage {
    constructor(webSocketMessage: string) {
        const messageData = ValueUtils.safeJsonParse<IDatabaseMessage>(webSocketMessage)
        this.action = messageData?.action ?? 'unknown'

    }
    action: TDatabaseMessageAction
}