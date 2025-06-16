import '../SharedUtils/DecoratorShim.ts'
import {TClassConstructor, TClassDecorator, TClassFieldDecorator} from '../SharedUtils/LanguageTypes.ts'
import Log from '../SharedUtils/Log.ts'
import {AbstractData} from './Data/AbstractData.ts'
import {DataMap, IDataStoreMeta} from './DataMap.ts'
import {ITypeBuilder} from './Data/DataType.ts'
import {AbstractOption} from './Options/AbstractOption.ts'
import {IOptionMeta, OptionsMap} from './OptionsMap.ts'

// region Class
type TClassConstructors = (TClassConstructor&AbstractData) | (TClassConstructor&AbstractOption)

export function Enlist(): TClassDecorator {
    return (
        constructor: TClassConstructors,
        context: ClassDecoratorContext
    ) => {
        const metadata = getMetadataObject<IDataStoreMeta|IOptionMeta>(context)
        metadata.classConstructor = constructor
        const isAbstractData = constructor instanceof AbstractData || constructor.prototype instanceof AbstractData
        const isAbstractOption = constructor instanceof AbstractOption || constructor.prototype instanceof AbstractOption
        if(isAbstractData) DataMap.add(metadata)
        else if(isAbstractOption) OptionsMap.add(metadata)
        else Log.w('@Enlist', 'Unhandled enlisting, no matching abstract class.', constructor, {
                data: isAbstractData,
                option: isAbstractOption
            })
    }
}
export function Description(description: string): TClassDecorator {
    return (_constructor: TClassConstructors, context) => {
        const metadata = getMetadataObject<IDataStoreMeta|IOptionMeta>(context)
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
export function ReferenceType(typeBuilder: ITypeBuilder): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta>(context)
        metadata.types ??= {}
        metadata.types[context.name.toString()] = typeBuilder.out
    }
}
export function Documentation(documentation: string): TClassFieldDecorator {
    return (_value, context) => {
        const metadata = getMetadataObject<IDataStoreMeta|IOptionMeta>(context)
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
// region

// region Utility
function getMetadataObject<T>(context: ClassDecoratorContext | ClassMemberDecoratorContext): T {
    //@ts-ignore
    context['metadata'] ??= {} // Required as it's a readonly value set to undefined otherwise.
    return context['metadata'] as T
}
// endregion