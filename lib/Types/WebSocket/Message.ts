export interface IMessage {
    /** ID of this message */
    id: string
    /** ID of the message this is a reply to */
    to?: string
    /** The type of message this is, in relation to the server */
    type: TMessageType
    /** The action this message should cause through the handler */
    action: string
    /** Additional meta data, can take additional fields */
    meta?: IMessageMeta
    /** An optional payload that can be anything. */
    payload?: any
}

export type TMessageType = 'unknown'
    | 'request'
    | 'response'
    | 'subscription'
    | 'broadcast'
    | 'error'

export interface IMessageMeta {
    timestamp?: number
    version?: string
    trace?: string
    [key: string]: string|number|boolean|undefined
}