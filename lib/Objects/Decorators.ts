import '../SharedUtils/DecoratorShim.ts'
import {TClassConstructor, TClassDecorator, TClassFieldDecorator} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {AbstractItem, abstractItemAllowedPrimitives} from './AbstractItem.ts'
import {AbstractOption} from './AbstractOption.ts'
import {
    AbstractTypeBuilder,
    BooleanTypeBuilder,
    ItemTypeBuilder,
    NumberTypeBuilder,
    OptionTypeBuilder,
    StringTypeBuilder
} from './DecoratorType.ts'
import {IItemMeta, ItemMap} from './ItemMap.ts'
import {IOptionMeta, OptionsMap} from './OptionsMap.ts'

// region Class
export interface IMetaBase {
    /** The constructor used to reinstate a JSON payload as a class. */
    classConstructor?: TClassConstructor
    className?: string
    abstractClassName?: string
}

type TClassConstructors = (TClassConstructor & AbstractItem) | (TClassConstructor & AbstractOption) | TClassConstructor

export interface IClassNodeHandle {
    id: number
    type: number
    label?: string
}

export function Enlist(): TClassDecorator {
    return (
        constructor: TClassConstructors,
        context: ClassDecoratorContext
    ) => {
        const metadata = getMetadataObject<IItemMeta | IOptionMeta>(context)
        metadata.classConstructor = constructor
        metadata.className = constructor.name
        metadata.abstractClassName = Object.getPrototypeOf(constructor).name
        const isAbstractData = constructor instanceof AbstractItem || constructor.prototype instanceof AbstractItem
        const isAbstractOption = constructor instanceof AbstractOption || constructor.prototype instanceof AbstractOption
        if (isAbstractData) ItemMap.add(metadata as IItemMeta)
        else if (isAbstractOption) OptionsMap.add(metadata as IOptionMeta)
        else Log.w('@Enlist', 'Unhandled enlisting, no matching abstract class.', constructor, {
                data: isAbstractData,
                option: isAbstractOption
            })
    }
}

export function Purpose(text: string): TClassDecorator {
    return (_constructor: TClassConstructors, context) => {
        const metadata = getMetadataObject<IItemMeta | IOptionMeta>(context)
        metadata.purpose = text
    }
}

export function Tag(text: string): TClassDecorator {
    return (_constructor, context) => {
        const metadata = getMetadataObject<IItemMeta>(context)
        metadata.tag = text
    }
}

export function HandleIn(nodeHandle: IClassNodeHandle): TClassDecorator {
    return (_constructor, context) => {
        const metadata = getMetadataObject<IItemMeta>(context)
        if(!metadata.handleInTypes) metadata.handleInTypes = {}
        metadata.handleInTypes[nodeHandle.id] = nodeHandle
    }
}

export function HandleOut(nodeHandle: IClassNodeHandle): TClassDecorator {
    return (_constructor, context) => {
        const metadata = getMetadataObject<IItemMeta>(context)
        if(!metadata.handleOutTypes) metadata.handleOutTypes = {}
        metadata.handleOutTypes[nodeHandle.id] = nodeHandle
    }
}

// endregion

// region Field
// region Main Data
export function Item(typeBuilder: ItemTypeBuilder | AbstractTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        Primitive(_value, context)
        const metadata = getMetadataObject<IItemMeta>(context)
        const name = context.name.toString()
        metadata.fieldTypes ??= {}
        metadata.fieldTypes.items ??= []
        metadata.fieldTypes.items.push(name)
        metadata.fields ??= {}
        metadata.fields[name] = typeBuilder.out
    }
}

export function Option(typeBuilder: OptionTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        Primitive(_value, context)
        const metadata = getMetadataObject<IItemMeta>(context)
        const name = context.name.toString()
        metadata.fieldTypes ??= {}
        metadata.fieldTypes.options ??= []
        metadata.fieldTypes.options.push(name)
        metadata.fields ??= {}
        metadata.fields[name] = typeBuilder.out
    }
}

export function Value(typeBuilder: StringTypeBuilder | NumberTypeBuilder | BooleanTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        Primitive(_value, context)
        const metadata = getMetadataObject<IItemMeta>(context)
        const name = context.name.toString()
        metadata.fieldTypes ??= {}
        metadata.fieldTypes.values ??= []
        metadata.fieldTypes.values.push(name)
        metadata.fields ??= {}
        metadata.fields[name] = typeBuilder.out
    }
}

/**  */
export function Primitive<This, Value>(_value: undefined, context: ClassFieldDecoratorContext<This, Value>) {
    // TODO: The below works in the TypeScript playground, but not in Deno.
    //  As this is shared code, we leave it active as it works in the browser.
    context.addInitializer(function (this: This) {
        const descriptor = Object.getOwnPropertyDescriptor(this, context.name)
        if(!descriptor || typeof descriptor.value === 'undefined') return

        const initialValue = descriptor.value
        let expectedType: string | undefined
        if(initialValue !== undefined && initialValue !== null) {
            const type = typeof initialValue
            if(abstractItemAllowedPrimitives.includes(type)) {
                expectedType = type
            }
        }
        if(!expectedType) return

        let currentValue = initialValue
        Object.defineProperty(this, context.name, {
            get: ()=>{
                return currentValue
            },
            set: (value: Value) => {
                if(value !== undefined && value !== null) {
                    const actualType = typeof value
                    if (actualType !== expectedType) {
                        Log.e(String(context.name), `Primitive Decorator: Type ${actualType} should have been ${expectedType}, skipping assignment.`)
                    } else {
                        currentValue = value
                    }
                }
            },
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable
        })
    })
}

// endregion

// region Meta Data
export function About(text: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IItemMeta | IOptionMeta>(context)
        metadata.about ??= {}
        metadata.about[context.name.toString()] = text
    }
}

export function Help(text: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IItemMeta>(context)
        metadata.help ??= {}
        metadata.help[context.name.toString()] = text
    }
}

// endregion
// region

// region Utility
function getMetadataObject<T>(context: ClassDecoratorContext | ClassMemberDecoratorContext): T {
    //@ts-ignore
    context['metadata'] ??= {} // Required as it's a readonly value set to undefined otherwise.
    return context['metadata'] as T
}

// endregion