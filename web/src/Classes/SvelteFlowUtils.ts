import {type Edge, type Node} from '@xyflow/svelte'
import Constants from '../../../lib/Classes/Constants.ts'
import {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
import {AbstractNode, type IAbstractNodeHandle} from '../../../lib/Objects/Item/AbstractNode.ts'
import {EventFlow} from '../../../lib/Objects/Item/Event/EventFlow.ts'
import SettingEventEdge from '../../../lib/Objects/Item/Setting/SettingEventEdge.ts'
import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
import type {IDictionary} from '../../../lib/SharedUtils/Dictionary.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'

export interface ISvelteNodeProps extends Record<string, unknown> {
    type: string
    id: number
    title: string
    label: string
    color: string
    topHandles: IAbstractNodeHandle[]
    bottomHandles: IAbstractNodeHandle[]
}

export interface ISvelteEdgeProps extends Record<string, unknown> {
    id: number
    color: string
}

export default class SvelteFlowUtils {
    /**
     * Builds a Node object for Svelte Flow from a SettingEventNode instance.
     * @param props
     * @param setting
     */
    static buildNode(props: ISvelteNodeProps, setting: SettingEventNode): Node {
        // TODO: Get which class the item ID is associated with and apply settings from it.
        return {
            id: `id-${props.id}`,
            position: {x: setting.xPos, y: setting.yPos},
            data: props,
            type: 'CustomNode',
            style: `background-color: ${props.color};`
        }
    }

    /**
     * Builds an array of Node objects for Svelte Flow from an array of SettingEventNode instances.
     * @param eventFlow
     */
    static buildNodes(eventFlow: EventFlow): Node[] {
        const settings: IDictionary<AbstractItem> = eventFlow.__children(eventFlow.nodes)
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventNode)
            .map(([id, setting]) => {
                const item = Object.values(eventFlow.__children([ValueUtils.ensureNumber(setting.item)])).pop()
                const props: ISvelteNodeProps = {
                    type: item?.__info().groupClass ?? '',
                    id: ValueUtils.ensureNumber(id),
                    title: 'Node',
                    label: 'N/A',
                    color: 'gray',
                    topHandles: [],
                    bottomHandles: []
                }
                if(this.isAbstractNode(item)) {
                    props.title = ValueUtils.removeFirstWord(item.__nodeTitle())
                    props.label = item.__nodeText()
                    props.color = item.__nodeColor()
                    props.topHandles = item.__nodeTopHandles()
                    props.bottomHandles = item.__nodeBottomHandles()
                }
                return this.buildNode(props, setting as SettingEventNode)
            })
    }

    /**
     * Builds an Edge object for Svelte Flow from a SettingEventEdge instance.
     * @param props
     * @param setting
     */
    static buildEdge(props: ISvelteEdgeProps, setting: SettingEventEdge): Edge {
        return {
            id: `id-${props.id}`,
            source: `id-${setting.source}`,
            sourceHandle: `${setting.sourceHandle}`,
            target: `id-${setting.target}`,
            targetHandle: `${setting.targetHandle}`,
            type: 'CustomEdge',
            data: {color: props.color}
        }
    }

    /**
     * Builds an array of Edge objects for Svelte Flow from an array of SettingEventEdge instances.
     * @param eventFlow
     */
    static buildEdges(eventFlow: EventFlow): Edge[] {
        const settings: IDictionary<AbstractItem> = eventFlow.__children(eventFlow.edges)
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventEdge)
            .map(([id, setting]) => {
                let color = this.getColorForType((setting as SettingEventEdge).sourceHandle)
                return this.buildEdge({
                    id: ValueUtils.ensureNumber(id),
                    color
                }, setting as SettingEventEdge)
            })
    }

    // region Utils
    static isAbstractNode(obj: unknown): obj is AbstractNode {
        return obj instanceof AbstractNode
    }

    static getColorForType(type: number): string {
        let color = 'gray'
        switch(type) {
            case Constants.nodeHandleIds.activate:
                color = 'yellow'
                break
            case Constants.nodeHandleIds.audio:
                color = 'orange'
                break
            case Constants.nodeHandleIds.image:
                color = 'green'
                break
            case Constants.nodeHandleIds.text:
                color = 'blue'
                break
            case Constants.nodeHandleIds.video:
                color = 'purple'
                break
            default: break
        }
        return color
    }
    // endregion
}