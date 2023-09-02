import Utils from '../Classes/Utils.js'
import DataMap from './DataMap.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'
import {DataUtils} from './DataUtils.js'
import {PresetText} from './Preset/PresetText.js'

export type TDataCategory =
    string
    | 'Setting'
    | 'Config'
    | 'Preset'
    | 'Event'
    | 'Trigger'
    | 'Action'

export default abstract class Data {
    /**
     * Should register this class in a suitable list.
     */
    abstract enlist(): void

    // region References

    /**
     * Get the name of the class without instantiating it.
     * If this is used the referenced class will be instanced in place.
     */
    static ref(): string {
        return this.name
    }

    /**
     * Get the name of the class appended with the ID flag.
     * If this ID is referenced when instancing a class, it will be filled with the object.
     */
    static refId() {
        return this.ref()+'|id'
    }

    /**
     * Get the name of the class appended with the ID and label flags.
     * If this ID is referenced when instancing a class, it will be filled with the object.
     */
    static refIdLabel(): string {
        return this.refId()+`|label`
    }

    /**
     * Get the name of the class appended with the ID flag.
     * If this ID is referenced when instancing a class, it will be filled with the key for the object.
     */
    static refIdKey() {
        return this.refId()+'|key'
    }

    /**
     * Get the name of the class appended with the ID and label flags.
     * If this ID is referenced when instancing a class, it will be filled with the key for the object.
     */
    static refIdKeyLabel() {
        return this.refIdKey()+`|label`
    }

    /**
     * Used to denote a generic object field that can contain any variant.
     * @param like Will show a list in the editor filtered on this as a starting word.
     */
    static genericRef(like: TDataCategory) {
        return Data.refId()+'|like='+like
    }

    // endregion

    /**
     * Submit any object to get mapped to this class instance.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     * @param fillReferences Replace reference IDs with the referenced object.
     */
    async __apply(instanceOrJsonResult: object = {}, fillReferences: boolean = false) {
        // Ensure valid input
        const prototype = Object.getPrototypeOf(this)
        const sourceObject = !!instanceOrJsonResult
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
                const isBaseDataObject = typeValues.class == Data.ref()
                if((hasSubInstance || isBaseDataObject) && typeValues.isIdReference && fillReferences) {
                    // Populate reference list of IDs with the referenced object.
                    if (Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for (const id of propertyValue) {
                            const dbItem = await DataBaseHelper.loadById(id.toString())
                            const emptyInstance = await DataMap.getInstance(dbItem?.class ?? typeValues.class)
                            if(typeValues.idToKey) {
                                newProp.push(dbItem?.key ?? id)
                            } else if(emptyInstance && dbItem?.data) {
                                newProp.push(await emptyInstance.__new(dbItem?.data ?? undefined, fillReferences))
                            } else {
                                console.warn(`Data.__apply: Unable to load instance for ${typeValues.class}`)
                            }
                        }
                        (this as any)[propertyName] = newProp

                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for (const [k, id] of Object.entries(propertyValue)) {
                            const dbItem = await DataBaseHelper.loadById(id?.toString())
                            const emptyInstance = await DataMap.getInstance(dbItem?.class ?? typeValues.class)
                            if(typeValues.idToKey) {
                                newProp[k] = dbItem?.key ?? id
                            } else if(emptyInstance) {
                                newProp[k] = await emptyInstance.__new(dbItem?.data ?? undefined, fillReferences)
                            } else {
                                console.warn(`Data.__apply: Unable to load instance for ${typeValues.class}`)
                            }
                        }
                        (this as any)[propertyName] = newProp
                    } else {
                        // It is single instance
                        const dbItem = await DataBaseHelper.loadById(propertyValue)
                        const emptyInstance = await DataMap.getInstance(dbItem?.class ?? typeValues.class)
                        if(typeValues.idToKey) {
                            (this as any)[propertyName] = dbItem?.key ?? propertyValue
                        } else if(emptyInstance) {
                            (this as any)[propertyName] = await emptyInstance.__new(dbItem?.data ?? undefined, fillReferences)
                        } else {
                            console.warn(`Data.__apply: Unable to load instance for ${typeValues.class}|${dbItem?.class} from ${propertyValue}`)
                        }
                    }
                } else if(hasSubInstance && !typeValues.isIdReference) {
                    // Fill list with new instances filled with the incoming data.
                    if(Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of propertyValue) {
                            newProp.push(await DataMap.getInstance(typeValues.class, v, fillReferences))
                        }
                        (this as any)[propertyName] = newProp
                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(propertyValue)) {
                            newProp[k] = await DataMap.getInstance(typeValues.class, v as object|undefined, fillReferences)
                        }
                        (this as any)[propertyName] = newProp
                    }
                } else {
                    // Fill with single instance or basic values.
                    const singleInstanceType = (this as any)[propertyName]?.constructor.name ?? (prototype as any)[propertyName]?.constructor.name
                    if(DataMap.hasInstance(singleInstanceType) && !typeValues.isIdReference) {
                        // It is a single instance class
                        (this as any)[propertyName] = await DataMap.getInstance(singleInstanceType, propertyValue, fillReferences)
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
                                default: console.warn(`Data.__apply: Unhandled field type for prop [${propertyName}] in [${thisClass}]: ${expectedType}`)
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
     * @param fillReferences Replace reference IDs with the referenced object.
     */
    async __new<T>(props?: T&object, fillReferences: boolean = false): Promise<T&Data> {
        const obj = Object.create(this) as T&Data // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        if(this.__getClass() == 'PresetText') {
            // TODO: THIS HAPPENS 18 TIMES WHEN THE EVENT IS TRIGGERED? WHAT THE SHIT?
            // TODO: THIS SHOULD BE A MAJOR PERFORMANCE ISSUE!
            // TODO: IT ALSO RESULTS IN AN EMPTY LIST IN PRACTICAL USE IN THE SPEECH ACTION!
            // TODO: WHAT IS GOING ON SHOULD WE REDO THIS WHOLE THING?!?!?!?!?!
            console.trace('Making new PresetText with props', props)
        }
        await obj.__apply(props ?? {}, fillReferences) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    async __clone(fillReferences: boolean = false) {
        return await this.__new(Utils.clone(this), fillReferences)
    }

    __getClass(): string {
        return this.constructor.name
    }
}

export class EmptyData extends Data { enlist() {} }

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
}

export interface IData<T>{
    [id: number]: T&Data|string|number|boolean
}