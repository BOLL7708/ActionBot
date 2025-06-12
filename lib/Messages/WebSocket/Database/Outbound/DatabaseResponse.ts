import Serializable from '../../../../SharedUtils/Serializable.ts'

export default class DatabaseResponse extends Serializable {
    messageId: string = ''
    dataJsonBase64: string = ''
}