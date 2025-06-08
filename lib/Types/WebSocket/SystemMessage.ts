import Serializable from '../../SharedUtils/Serializable.mts'

export type TSystemMessageAction =
    | 'unknown'
    | 'ping'
    | 'pong'

export default class SystemMessage extends Serializable {
    action: TSystemMessageAction = 'unknown'
}