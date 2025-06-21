import {IDictionary} from '../../SharedUtils/Dictionary.ts'
import {AbstractData} from '../AbstractData.ts'
import {DataMap} from '../DataMap.ts'

export class DataUtils {
    // region Referencing
    static getImageFileExtensions() {
        return ['apng','avif','gif','jpg','jpeg','png','svg','webp']
    }
    static getAudioFileExtensions() {
        return ['mp3','wav','ogg','aac','m4a','flac','opus','webm','midi','mid']
    }
    static getVideoFileExtensions() {
        return ['mp4','webm']
    }
    // endregion
}