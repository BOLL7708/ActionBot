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
        if (isAbstractData) DataMap.add(metadata as IDataStoreMeta)
        else if (isAbstractOption) OptionsMap.add(metadata as IOptionMeta)
        else Log.w('@Enlist', 'Unhandled enlisting, no matching abstract class.', constructor, {
                data: isAbstractData,
                option: isAbstractOption
            })
    }
}

export function Purpose(text: string): TClassDecorator {
    return (_constructor: TClassConstructors, context) => {
        const metadata = getMetadataObject<IDataStoreMeta | IOptionMeta>(context)
        metadata.purpose = text
    }
}

export function Tag(text: string): TClassDecorator {
    return (_constructor, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        metadata.tag = text
    }
}

// endregion

// region Field
// region Main Data
export function Item(typeBuilder: ReferenceTypeBuilder | GenericTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        const name = context.name.toString()
        metadata.fieldTypes ??= {}
        metadata.fieldTypes.references ??= []
        metadata.fieldTypes.references.push(name)
        metadata.fields ??= {}
        metadata.fields[name] = typeBuilder.out
    }
}

export function Option(typeBuilder: OptionTypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
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
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        const name = context.name.toString()
        metadata.fieldTypes ??= {}
        metadata.fieldTypes.values ??= []
        metadata.fieldTypes.values.push(name)
        metadata.fields ??= {}
        metadata.fields[name] = typeBuilder.out
    }
}

// endregion

// region Meta Data
export function About(text: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta | IOptionMeta>(context)
        metadata.about ??= {}
        metadata.about[context.name.toString()] = text
    }
}

export function Help(text: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
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