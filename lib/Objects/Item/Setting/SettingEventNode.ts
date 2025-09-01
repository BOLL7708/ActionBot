import {IDictionary} from '../../../SharedUtils/Dictionary.ts'
import {About, Enlist, Item, Purpose} from '../../Decorators.ts'
import {TPrimitives, Type} from '../../DecoratorType.ts'
import {AbstractSetting} from './AbstractSetting.ts'

@Enlist()
@Purpose('Store the node data for events created in the node editor.')
export default class SettingEventNode extends AbstractSetting {
    @About('Store any type of data item that this node is associated with.')
    @Item(Type.generic(''))
    item: number = 0

    @About('The X position of the node in the editor.')
    xPos: number = 0
    @About('The Y position of the node in the editor.')
    yPos: number = 0
}