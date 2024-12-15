import {IDatabaseItem} from '../../Types/DatabaseHelper.mts'

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
     * Submit any object to get mapped to this class instance. Implemented in runner.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     * @param fill If IDs should be replaced by what they reference.
     */
    __apply(instanceOrJsonResult: object = {}, fill: boolean) {}

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

export class DataEntries<T> {
    type: EDataType = EDataType.Single
    dataSingle: IDatabaseItem<T> = {id: 0, key: '', class: '', pid: null, data: null, filledData: null}
    dataArray: IDatabaseItem<T>[] = []
    dataDictionary: { [key:string]: IDatabaseItem<T>} = {}
}