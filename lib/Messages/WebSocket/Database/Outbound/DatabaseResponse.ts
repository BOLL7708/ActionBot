import Serializable from '../../../../SharedUtils/Serializable.ts'
import {IJsonStore} from '../../../../Types/Database.ts'

export default class DatabaseResponse extends Serializable {
    messageId: string = ''
    items: IJsonStore[] = []
    savedRowId: number = -1
    deleteCount: number = -1
}