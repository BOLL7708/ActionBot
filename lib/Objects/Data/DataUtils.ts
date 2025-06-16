import {IDatabaseItem} from '../../index.ts'
import {IDictionary} from '../../SharedUtils/Dictionary.ts'
import {AbstractData} from './AbstractData.ts'
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

    // region Conversion
    static convertCollection(className: string, propertyName: string, collection: any): any {
        if (!collection) return collection
        const originalProperty = (DataMap.getMeta(className)?.instance as any)[propertyName]
        const originalIsArray = Array.isArray(originalProperty)
        const propertyIsArray = Array.isArray(collection)
        if (!propertyIsArray && originalIsArray) {
            console.warn('Property is an object but should be an array!')
            collection = Object.values(collection)
        }
        if (propertyIsArray && !originalIsArray) {
            console.warn('Property is an array but should be an object!')
            let i = 0
            collection = Object.fromEntries(
                (collection as []).map(v => [i++, v])
            )
        }
        return collection
    }

    /**
     * Returns a dictionary of all the data referenced by their database key.
     * Filters out empty data entries.
     * @param items
     */
    static getKeyDataDictionary<T>(items: IDictionary<IDatabaseItem<T>>): IDictionary<T> {
        return Object.fromEntries(
            Object.values(items).map(
                item => [item.key, item.filledData]
            ).filter(pair => !!pair[1])
        )
    }

    /**
     * Returns a dictionary of all the data referenced by their database row id.
     * Filters out empty data entries.
     * @param items
     */
    static getIdDataDictionary<T>(items: IDictionary<IDatabaseItem<T>>): IDictionary<T> {
        return Object.fromEntries(
            Object.values(items).map(
                item => [item.id.toString(), item.filledData]
            ).filter(pair => !!pair[1])
        )
    }
    // endregion

    // region Data

    static buildFakeDataEntries<T>(instance: T&AbstractData, id: number = 0, key: string = ''): DataEntries<T&AbstractData> {
        const entries = new DataEntries<T&AbstractData>()
        // TODO: Apparently using instance.__class() broke here, so not everything coming in retains the Data class.
        entries.dataSingle = {id, key, class: instance.constructor.name, pid: null, data: instance, filledData: instance }
        return entries
    }
}