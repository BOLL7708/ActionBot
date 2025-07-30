import {Enlist, Item} from '../../Decorators.ts'
import SettingEventEdge from '../Setting/SettingEventEdge.ts'
import SettingEventNode from '../Setting/SettingEventNode.ts'
import {AbstractEvent} from './AbstractEvent.ts'

@Enlist()
export default class EventFlow extends AbstractEvent {
    @Item(SettingEventNode.ref)
    nodes: number[] = []

    @Item(SettingEventEdge.ref)
    edges: number[] = []
}

