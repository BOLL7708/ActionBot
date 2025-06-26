// TODO: This file contains a whole range of random stuff, split it up or organize it better?

export type TPrimitives =
    | 'boolean'
    | 'number'
    | 'string'

export interface ITypeBuilder {
    get out(): IItemType
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
    readonly #type: IItemType

    constructor(className: string, isAbstract: boolean) {
        this.#type = {}
        if (isAbstract) {
            this.#type.abstractClassName = className
        } else {
            this.#type.className = className
        }
        this.#type.isItem = true
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

export class AbstractTypeBuilder implements ITypeBuilder {
    readonly #type: IItemType

    // TODO: Not sure if this is enough, revisit later when making the editor.
    constructor(abstractClassName: string) {
        this.#type = {}
        this.#type.abstractClassName = abstractClassName
        this.#type.isItem = true
    }

    get out() {
        return this.#type
    }
}

export class OptionTypeBuilder implements ITypeBuilder {
    readonly #type: IItemType

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

export class StringTypeBuilder implements ITypeBuilder {
    readonly #type: IItemType

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
    readonly #type: IItemType

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
    readonly #type: IItemType

    constructor() {
        this.#type = {}
        this.#type.primitive = 'boolean'
    }

    get toggle(): IItemType {
        this.#type.booleanToggle = true
        return this.#type
    }

    get out() {
        return this.#type
    }
}

export interface IItemType {
    /** A flag that clarifies that this value references a different row in the database. */
    isItem?: boolean
    /** The value stored is referencing an Option class, meaning this has a limited range of possible values. */
    isOption?: boolean
    /** The value stored should be a reference to a different row in the database, that can be reinstated as this class. */
    className?: string
    /** The class one step down the prototype ladder, used to do group matches. */
    abstractClassName?: string
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

export class FileTypePresets {
    static readonly imageFileExtensions = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'webp']
    static readonly audioFileExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'opus', 'webm', 'midi', 'mid']
    static readonly videoFileExtensions = ['mp4', 'webm']
}