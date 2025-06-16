import '../SharedUtils/DecoratorShim.ts'
import {TClassConstructor, TClassDecorator, TClassFieldDecorator} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {AbstractData} from './AbstractData.ts'
import {AbstractOption} from './AbstractOption.ts'
import {
    BooleanTypeBuilder,
    GenericTypeBuilder,
    NumberTypeBuilder,
    OptionTypeBuilder,
    ReferenceTypeBuilder,
    StringTypeBuilder
} from './Data/DataType.ts'
import {DataMap, IDataStoreMeta} from './DataMap.ts'
import {IOptionMeta, OptionsMap} from './OptionsMap.ts'

// region Class
type TClassConstructors = (TClassConstructor & AbstractData) | (TClassConstructor & AbstractOption)

export function Enlist(): TClassDecorator {
    return (
        constructor: TClassConstructors,
        context: ClassDecoratorContext
    ) => {
        const metadata = getMetadataObject<IDataStoreMeta | IOptionMeta>(context)
        metadata.classConstructor = constructor
        const isAbstractData = constructor instanceof AbstractData || constructor.prototype instanceof AbstractData
        const isAbstractOption = constructor instanceof AbstractOption || constructor.prototype instanceof AbstractOption
        if (isAbstractData) DataMap.add(metadata)
        else if (isAbstractOption) OptionsMap.add(metadata)
        else Log.w('@Enlist', 'Unhandled enlisting, no matching abstract class.', constructor, {
                data: isAbstractData,
                option: isAbstractOption
            })
    }
}

export function Description(description: string): TClassDecorator {
    return (_constructor: TClassConstructors, context) => {
        const metadata = getMetadataObject<IDataStoreMeta | IOptionMeta>(context)
        metadata.description = description
    }
}

export function Tag(tag: string): TClassDecorator {
    return (_constructor, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        metadata.tag = tag
    }
}

// endregion

// region Field
// region Main Data
export function Reference(typeBuilder: ReferenceTypeBuilder | GenericTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        const name = context.name.toString()
        metadata.references ??= []
        metadata.references.push(name)
        metadata.types ??= {}
        metadata.types[name] = typeBuilder.out
    }
}

export function Option(typeBuilder: OptionTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        const name = context.name.toString()
        metadata.options ??= []
        metadata.options.push(name)
        metadata.types ??= {}
        metadata.types[name] = typeBuilder.out
    }
}

export function Primitive(typeBuilder: StringTypeBuilder | NumberTypeBuilder | BooleanTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        const name = context.name.toString()
        metadata.primitives ??= []
        metadata.primitives.push(name)
        metadata.types ??= {}
        metadata.types[name] = typeBuilder.out
    }
}

// endregion

// region Meta Data
export function Documentation(documentation: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta | IOptionMeta>(context)
        metadata.documentation ??= {}
        metadata.documentation[context.name.toString()] = documentation
    }
}

export function Instruction(instruction: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        metadata.instructions ??= {}
        metadata.instructions[context.name.toString()] = instruction
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