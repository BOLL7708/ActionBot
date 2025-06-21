import {TClassConstructor} from '../../SharedUtils/LanguageTypes.ts'
import {AbstractOption} from '../AbstractOption.ts'

export type TPrimitives =
    | ''
    | 'boolean'
    | 'number'
    | 'string'

export interface ITypeBuilder {
    get out(): IDataStoreType
}

export class Type {
    static generic(genericLike: string): AbstractTypeBuilder {
        return new AbstractTypeBuilder(genericLike)
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

export class ItemTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType

    constructor(className: string) {
        this.#type = {}
        this.#type.className = className
        this.#type.isReference = true
    }

    /** Will reference the database entry by rowId */
    get id(): ItemTypeBuilder {
        this.#type.primitive = 'number'
        return this
    }

    /** Will reference the database entry by groupKey */
    get key(): ItemTypeBuilder {
        this.#type.primitive = 'string'
        return this
    }

    get label(): ItemTypeBuilder {
        this.#type.useLabel = true
        return this
    }

    get out() {
        return this.#type
    }
}

export class OptionTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType

    constructor(className: string, primitive: TPrimitives | undefined) {
        this.#type = {}
        this.#type.className = className
        this.#type.primitive = primitive
        this.#type.isOption = true
    }

    get out() {
        return this.#type
    }
}

export class AbstractTypeBuilder implements ITypeBuilder {
    #type: IDataStoreType // TODO: Update to store and use and filter on abstractClassName

    constructor(genericLike: string) { // TODO: Build a type for this?
        this.#type = {}
        this.#type.genericLike = genericLike
        this.#type.isReference = true
    }

    get out() {
        return this.#type
    }
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

    get out() {
        return this.#type
    }
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

    get out() {
        return this.#type
    }
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

    get out() {
        return this.#type
    }
}


export interface IDataStoreType {
    /** A flag that clarifies that this value references a different row in the database. */
    isReference?: boolean
    /** The value stored is referencing an Option class, meaning this has a limited range of possible values. */
    isOption?: boolean
    /** The reference(s) stored can point to any class that starts with this value. */
    genericLike?: string
    /** The value stored should be a reference to a different row in the database, that can be reinstated as this class. */
    className?: string
    /** The value stored has this literal type, which is true also for references, which can be strings or numbers. */
    primitive?: TPrimitives

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