import {About, Enlist, Item, Purpose} from '../../Decorators.ts'
import {AbstractSetting} from './AbstractSetting.ts'
import SettingEventNode from './SettingEventNode.ts'

@Enlist()
@Purpose('Store the connecting edge between two nodes in the node editor.')
export default class SettingEventEdge extends AbstractSetting {
    @About('The ID of the source node.')
    @Item(SettingEventNode.ref)
    source: number = 0

    @About('The ID of the source handle on the source node.')
    sourceHandle: number = 0

    @About('The ID of the target node.')
    @Item(SettingEventNode.ref)
    target: number = 0

    @About('The ID of the target handle on the target node.')
    targetHandle: number = 0
}