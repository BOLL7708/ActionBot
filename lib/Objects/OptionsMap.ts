import {IStringDictionary} from '../SharedUtils/Dictionary.ts'
import {TClassConstructor} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {AbstractOption} from './AbstractOption.ts'


export interface IOptionMeta {
    classConstructor?: TClassConstructor & AbstractOption
    purpose?: string
    about?: IStringDictionary
}

export class OptionsMap {
    static readonly #tag = this.name
    static #map = new Map<string, IOptionMeta>()

    static add(meta: IOptionMeta) {
        const className = meta.classConstructor?.name
        if (className) {
            Log.v(this.#tag, 'add', className)
            this.#map.set(className, meta)
        }
    }

    static get(className: string): IOptionMeta | undefined {
        const meta = this.#map.get(className)
        if (meta) {
            return meta
        } else Log.w(this.#tag, 'Could not retrieve meta for', className)
    }

    static has(className: string): boolean {
        return this.#map.has(className)
    }
}

// getDocumentationFromValue(value: any): string|undefined {
//     if(!this.documentation) return undefined
//     const instance = Object.assign(this.prototype)
//     for(const prop of Object.keys(instance)) {
//         console.log(prop, instance[prop], value, instance[prop] == value)
//         if(instance[prop] == value)  {
//             return this.documentation[prop]
//         }
//     }
//     return undefined
// }
