// TODO: Migrate bot dependencies, like the newly added Log class, why did I add that here in shared? Boggles the mind.
import Log from '../../SharedUtils/Log.mts'
import {DataUtils} from './DataUtils.mts'
import {DataMap} from './DataMap.mts'
import DatabaseHelper, {IDatabaseItem} from '../../../bot/Helpers/DatabaseHelper.mts'
import Utils from '../../../bot/Utils/Utils.mts'

export type TDataCategory =
    string
    | 'Setting'
    | 'Config'
    | 'Preset'
    | 'Event'
    | 'Trigger'
    | 'Action'

export abstract class AbstractData {
    /**
     * Should register this class in a suitable list.
     */
    abstract enlist(): void

    // region References

    /**
     * Get the name of the class without instantiating it.
     * If this is used the referenced class will be instantiated in place and stored directly in ths JSON object.
     */
    static get ref(): DataRefBuilder {
        return new DataRefBuilder(this.name)
    }
    /**
     * Used to denote a generic object field that can contain any variant and is automatically an ID reference.
     * @param like Will show a list in the editor filtered on this as a starting word for matching classes.
     */
    static genericRef(like: TDataCategory): DataRefBuilder {
        return new DataRefBuilder(AbstractData.name).id.like(like)
    }

    // endregion

    /**
     * Submit any object to get mapped to this class instance.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     * @param fill If IDs should be replaced by what they reference.
     */
    __apply(instanceOrJsonResult: object = {}, fill: boolean) {
        const TAG = this.constructor.name
        // Ensure valid input
        const prototype = Object.getPrototypeOf(this)
        const sourceObject =
            !!instanceOrJsonResult
            && typeof instanceOrJsonResult == 'object'
            && !Array.isArray(instanceOrJsonResult)
                ? instanceOrJsonResult
                : {}
        const thisClass = this.constructor.name

        // Make an entry map of the incoming properties just to enable orderly application below this.
        const entryMap: Map<string, any> = new Map()
        for(const [name, value] of Object.entries(sourceObject)) {
            entryMap.set(name, value)
        }
        /*
         * We loop over the properties of this object, combined with the prototype properties, just in case
         * this is an already cloned empty object, which will have all defaults in the prototype.
         * We loop over possible properties instead of the incoming properties to retain the original property order.
         */
        const possibleProperties = [...Object.keys(this), ...Object.keys(prototype)]
        for(const propertyName of possibleProperties) {
            let propertyValue = entryMap.has(propertyName) ? entryMap.get(propertyName) : undefined
            propertyValue = DataUtils.convertCollection(thisClass, propertyName, propertyValue) // Convert to correct collection type
            if(propertyName.length > 0 && propertyValue !== undefined) {
                // We cast to `any` in here to be able to set the props at all.
                const types = DataMap.getMeta(thisClass)?.types ?? {}
                const typeValues = DataUtils.parseRef(types[propertyName] ?? '')
                const hasSubInstance = DataMap.hasInstance(typeValues.class)
                const isBaseDataObject = typeValues.class == AbstractData.ref.build()
                const newProp = new DataEntries()
                if((hasSubInstance || isBaseDataObject) && typeValues.isIdReference && fill) {
                    // Populate reference list of IDs with the referenced object.
                    if (Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        newProp.type = EDataType.Array
                        for (const id of propertyValue) {
                            if(typeof id !== 'number' && typeof id !== 'string') {
                                Log.w(TAG,`Data: ID was not a number nor string, skipping:`, id)
                                continue
                            }
                            const dbItem = DatabaseHelper.loadById(id.toString())
                            if(dbItem?.data && dbItem?.filledData) newProp.dataArray.push(dbItem)
                            else if(id !== 0) Log.w(TAG, `Data.__apply: Unable to load instance for ${typeValues.class}:${id}, it might not exist anymore.`)
                        }
                        (this as unknown as any)[propertyName] = newProp
                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        newProp.type = EDataType.Dictionary
                        for (const [k, idValue] of Object.entries(propertyValue)) {
                            const id = Utils.ensureNumber(idValue)
                            const dbItem = DatabaseHelper.loadById(id.toString())
                            if(dbItem?.data && dbItem?.filledData) newProp.dataDictionary[k] = dbItem
                            else if(id !== 0) Log.w(TAG, `Data.__apply: Unable to load instance for ${typeValues.class}:${id}, it might not exist anymore.`)
                        }
                        (this as unknown as any)[propertyName] = newProp
                    } else {
                        // It is single instance
                        const dbItem = DatabaseHelper.loadById(propertyValue)
                        newProp.type = EDataType.Single
                        if(dbItem?.data && dbItem?.filledData) newProp.dataSingle = dbItem
                        else if(propertyValue !== 0) Log.w(TAG, `Data.__apply: Unable to load instance for ${typeValues.class}|${dbItem?.class} from (${propertyValue}), it might not exist anymore.`);
                        (this as unknown as any)[propertyName] = newProp
                    }
                } else if(hasSubInstance && !typeValues.isIdReference) {
                    // Fill list with new instances filled with the incoming data.
                    if(Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of propertyValue) {
                            newProp.push(DataMap.getInstance({ className: typeValues.class, props: v, fill }))
                        }
                        (this as any)[propertyName] = newProp
                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(propertyValue)) {
                            newProp[k] = DataMap.getInstance({ className: typeValues.class, props: v as object|undefined, fill })
                        }
                        (this as any)[propertyName] = newProp
                    }
                } else {
                    // Fill with single instance or basic values.
                    const singleInstanceType = (this as any)[propertyName]?.constructor.name ?? (prototype as any)[propertyName]?.constructor.name
                    if(DataMap.hasInstance(singleInstanceType) && !typeValues.isIdReference) {
                        // It is a single instance class
                        (this as any)[propertyName] = DataMap.getInstance({ className: singleInstanceType, props: propertyValue, fill })
                    } else {
                        // It is a basic value, just set it.
                        const expectedType = typeof (this as any)[propertyName]
                        const actualType = typeof propertyValue
                        let correctedProp = propertyValue
                        if(expectedType !== actualType) {
                            switch(expectedType) {
                                case 'string': correctedProp = propertyValue?.toString() ?? ''; break;
                                case 'number': correctedProp = parseFloat(propertyValue?.toString() ?? 0); break;
                                case 'boolean': correctedProp = Utils.toBool(propertyValue); break;
                                default: Log.w(TAG, `Data.__apply: Unhandled field type for prop [${propertyName}] in [${thisClass}]: ${expectedType}`, propertyValue)
                            }
                        }
                        (this as any)[propertyName] = correctedProp
                    }
                }
            }
        }
        // Copy values from the prototype to the instance, because if we don't, the prototype will get future assignments and not the instance.
        const propsKeys = Object.keys(sourceObject)
        const prototypePropsKeys = Object.keys(prototype).filter(
            (prop) => { return prototype.hasOwnProperty(prop) && !propsKeys.includes(prop) }
        )
        for(const name of prototypePropsKeys) {
            (this as any)[name] = prototype[name] ?? undefined
        }
    }

    /**
     * Returns a new instance with this class as a prototype, meaning it will be seen as the same class by the system.
     * @param props Optional properties to apply to the new instance, usually a plain object cast to the same class which is why we need to do this.
     * @param fill If IDs should be replaced by what they reference.
     */
    __new<T>(props: (T&object)|undefined, fill: boolean): T&AbstractData {
        const obj = Object.create(this) as T&AbstractData // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        obj.__apply(props ?? {}, fill) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    __getClass(): string {
        return this.constructor.name
    }
}

export class EmptyData extends AbstractData { enlist() {} }

export class DataRefBuilder {
    private parts: string[] = []
    constructor(name: string) {
        this.parts.push(name)
    }
    /**
     * Append the ID flag.
     * The JSON will store an ID referencing this class, at runtime the ID will be replaced with that class instantiated.
     */
    public get id():DataRefBuilder {
        this.parts.push('id')
        return this
    }

    /**
     * Append the label flag.
     * The editor will show a specified label value instead of the key when referencing this object in a list.
     */
    public get label():DataRefBuilder {
        this.parts.push('label')
        return this
    }

    /**
     * Append the like flag.
     * The pattern to match classes with when using a generic reference.
     * @param pattern
     */
    public like(pattern: TDataCategory):DataRefBuilder {
        this.parts.push(`like=${pattern}`)
        return this
    }

    /**
     * Outputs the reference string
     */
    public build(): string {
        return this.parts.join('|')
    }
}

export class DataRefValues {
    original = ''
    class = ''
    isIdReference = false
    useLabel = false
    idToKey = false
    genericLike = ''
    option = false
    secret = false
    file: string[] = []
    range: number[] = []
    code = false
    type = ''
    isToggle = false
}

export enum EDataType {
    Single,
    Array,
    Dictionary
}

export class DataEntries<T>{
    type: EDataType = EDataType.Single
    dataSingle: IDatabaseItem<T> = {id: 0, key: '', class: '', pid: null, data: null, filledData: null}
    dataArray: IDatabaseItem<T>[] = []
    dataDictionary: { [key:string]: IDatabaseItem<T>} = {}
}