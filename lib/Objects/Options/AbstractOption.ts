import {IStringDictionary} from '../../SharedUtils/Dictionary.ts'
import {TPrimitives, Type} from '../Data/DataType.ts'

export abstract class AbstractOption {
    static get ref() {
        return Type.option(this.name, this.getType())
    }
    static #keyMap?: IStringDictionary
    static keyMap(): IStringDictionary {
        if(!this.#keyMap) {
            const entries = Object.entries(this)
            this.#keyMap = Object.fromEntries(
                entries.map(([key, value]) => [value.toString(), key.toString()])
            ) as IStringDictionary
        }
        return this.#keyMap
    }

    static nameFromKey(key: string|number): string {
        return this.keyMap()[key.toString()] ?? key.toString()
    }

    static getType(): TPrimitives {
        const type = typeof Object.values(this).pop()
        let allowedTypes: string[] = [typeof '', typeof 0, typeof false]
        return (allowedTypes.includes(type) ? type : '') as TPrimitives
    }
}