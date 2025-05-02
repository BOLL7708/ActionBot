export interface IDatabaseMessage {
    action: 'load'|'save'|'delete'
    nonce: string
    id?: number
    key?: string
    group?: string
    parentId?: number
    // TODO: Add support here for more advanced stuff, OR, to not repeat the PHP coms make it different types of messages.
}