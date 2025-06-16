import {TClassConstructor} from '../../SharedUtils/LanguageTypes.ts'
import {AbstractOption} from '../Options/AbstractOption.ts'

export type TPrimitives =
    | ''
    | 'boolean'
    | 'number'
    | 'string'

export interface ITypeBuilder {
    get out(): IDataStoreType
}

export class Type {
    static reference(className: string): ReferenceTypeBuilder {
        return new ReferenceTypeBuilder(className)
    }
    static option(className: string, primitive: TPrimitives): OptionTypeBuilder {
        return new OptionTypeBuilder(className, primitive)
    }
    static generic(genericLike: string): GenericTypeBuilder {
        return new GenericTypeBuilder(genericLike)
    }
    static get string(): StringTypeBuilder {
        return new StringTypeBuilder()
    }
    static get number(): NumberTypeBuilder {
        return new NumberTypeBuilder()
    }
    static get boolean(): BooleanTypeBuilder {
        return new BooleanTypeBuilder()
    }
}
export class ReferenceTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor(className: string) {
        this.#type = {}
        this.#type.className = className
        this.#type.isReference = true
    }
    /** Will reference the database entry by rowId */
    get id(): ReferenceTypeBuilder {
        this.#type.primitive = 'number'
        return this
    }
    /** Will reference the database entry by groupKey */
    get key(): ReferenceTypeBuilder {
        this.#type.primitive = 'string'
        return this
    }
    get label(): ReferenceTypeBuilder {
        this.#type.useLabel = true
        return this
    }
    get out() { return this.#type }
}
export class OptionTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor(className: string, primitive: TPrimitives) {
        this.#type = {}
        this.#type.className = className
        this.#type.primitive = primitive
        this.#type.isOption = true
    }
    get out() { return this.#type }
}
export class GenericTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor(genericLike: string) { // TODO: Build a type for this?
        this.#type = {}
        this.#type.genericLike = genericLike
        this.#type.isReference = true
    }
    get out() { return this.#type }
}
export class StringTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor() {
        this.#type = {}
        this.#type.primitive = 'string'
    }
    get secret(): StringTypeBuilder {
        this.#type.stringSecret = true
        return this
    }
    get code(): StringTypeBuilder {
        this.#type.stringCode = true
        return this
    }
    files(files: string[]): StringTypeBuilder {
        this.#type.stringFiles = files
        return this
    }
    get out() { return this.#type }
}
export class NumberTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor() {
        this.#type = {}
        this.#type.primitive = 'number'
    }
    range(min: number, max: number, step: number): NumberTypeBuilder {
        this.#type.numberRange = true
        this.#type.numberRangeMin = min
        this.#type.numberRangeMax = max
        this.#type.numberRangeStep = step
        return this
    }
    get out() { return this.#type }
}
export class BooleanTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType
    constructor() {
        this.#type = {}
        this.#type.primitive = 'boolean'
    }
    get toggle(): IDataStoreType {
        this.#type.booleanToggle = true
        return this.#type
    }
    get out() { return this.#type }
}


export interface IDataStoreType {
    className?: string
    primitive?: TPrimitives
    isReference?: boolean
    isOption?: boolean
    genericLike?: string
    useLabel?: boolean
    stringFiles?: string[]
    stringSecret?: boolean
    stringCode?: boolean
    numberRange?: boolean
    numberRangeMin?: number
    numberRangeMax?: number
    numberRangeStep?: number
    booleanToggle?: boolean
}