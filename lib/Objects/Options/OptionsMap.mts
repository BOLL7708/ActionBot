// TODO: Migrate bot dependencies to shared
import Log from '../../SharedUtils/Log.mts'
import {IStringDictionary} from '../../Types/Dictionary.mts'
import {TNoFunctions} from '../Data/DataMap.mts'
import {DataMeta} from '../Data/DataMeta.mts'
import {AbstractOption} from './AbstractOption.mts'

export class OptionsMap {
    private static _map = new Map<string, OptionMeta>()

    static getPrototype(className: string|undefined): AbstractOption|undefined {
        if(className && this.hasPrototype(className)) {
            const meta = this._map.get(className)
            if(meta) return meta.prototype
        }
        return undefined
    }

    static addPrototype<T>({prototype, description, documentation}: {
        prototype: T&AbstractOption&Function,
        description?: string|undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>
    }) {
        const className = prototype.name
        const meta = new OptionMeta(
            prototype,
            description,
            documentation as IStringDictionary|undefined
        )
        this._map.set(className, meta)
    }

    public static hasPrototype(
        className: string|undefined
    ): boolean {
        const has = className ? this._map.has(className) : false
        if(!has) Log.e(this.constructor.name, `Option: "${className}" does not exist in the OptionsMap!`)
        return has
    }

    public static getMeta(className: string): OptionMeta|undefined {
        return this.hasPrototype(className) ? this._map.get(className) : undefined
    }
}

export class OptionMeta extends DataMeta {
    constructor(
        public prototype: AbstractOption,
        public override description?: string,
        public override documentation?: IStringDictionary
    ) {
        super()
    }
    getDocumentationFromValue(value: any): string|undefined {
        if(!this.documentation) return undefined
        const instance = Object.assign(this.prototype)
        for(const prop of Object.keys(instance)) {
            console.log(prop, instance[prop], value, instance[prop] == value)
            if(instance[prop] == value)  {
                return this.documentation[prop]
            }
        }
        return undefined
    }
}