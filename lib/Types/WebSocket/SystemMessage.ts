import AbstractMessage from './AbstractMessage.ts'

export type TSystemMessageAction =
    | 'unknown'
    | 'ping'

export default class SystemMessage extends AbstractMessage {
    action: TSystemMessageAction = 'unknown'
}