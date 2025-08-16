import {BaseEdge, type Connection, type Edge, type Node} from '@xyflow/svelte'
import Constants from '../../../lib/Classes/Constants.ts'
import {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
import {EventFlow} from '../../../lib/Objects/Item/Event/EventFlow.ts'
import SettingEventEdge from '../../../lib/Objects/Item/Setting/SettingEventEdge.ts'
import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
import type {IDictionary} from '../../../lib/SharedUtils/Dictionary.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import type {IClassNodeHandle} from "../../../lib/Objects/Decorators.ts";
import {AbstractNode} from "../../../lib/Objects/Item/AbstractNode.ts";
import Log from "../../../lib/SharedUtils/Log.ts";

export interface ISvelteNodeProps extends Record<string, unknown> {
    type: string
    id: number
    title: string
    label: string
    color: string
    inHandles: IClassNodeHandle[]
    outHandles: IClassNodeHandle[]
}

export default class SvelteFlowUtils {
    static #tag = SvelteFlowUtils.name

    /**
     * Builds a Node object for Svelte Flow from a SettingEventNode instance.
     * @param props
     * @param setting
     */
    static buildNode(props: ISvelteNodeProps, setting: SettingEventNode): Node {
        return {
            id: `${props.id}`,
            position: {x: setting.xPos, y: setting.yPos},
            data: props,
            type: 'CustomNode',
            style: `background-color: ${props.color};`
        }
    }

    static buildNodeFromItem(item: AbstractItem | undefined, setting: SettingEventNode): Node {
        const props: ISvelteNodeProps = {
            type: item?.__info().groupClass ?? 'AbstractItem',
            id: setting.__info().rowId,
            title: 'Node',
            label: 'N/A',
            color: 'gray',
            inHandles: [],
            outHandles: []
        }
        if (item && this.isAbstractNode(item)) {
            const meta = item.__meta()
            props.title = ValueUtils.removeFirstWord(item.__nodeTitle())
            props.label = item.__nodeText()
            props.color = item.__nodeColor()
            props.inHandles = Object.values(meta?.handleInTypes ?? {})
            props.outHandles = Object.values(meta?.handleOutTypes ?? {})
        }
        return this.buildNode(props, setting as SettingEventNode)
    }

    /**
     * Builds an array of Node objects for Svelte Flow from an array of SettingEventNode instances.
     * @param eventFlow
     */
    static buildNodes(eventFlow: EventFlow): Node[] {
        const settings: IDictionary<AbstractItem> = eventFlow.__children(eventFlow.nodes)
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventNode)
            .map(([_id, setting]) => {
                const item = Object.values(eventFlow.__children([ValueUtils.ensureNumber(setting.item)])).pop()
                return this.buildNodeFromItem(item, setting as SettingEventNode)
            })
    }

    /**
     * Builds an Edge object for Svelte Flow from a SettingEventEdge instance.
     * @param id
     * @param handleType
     * @param setting
     */
    static buildEdge(id: number, handleType: number, setting: SettingEventEdge): Edge {
        return {
            id: `${id}`,
            source: `${setting.source}`,
            sourceHandle: `${setting.sourceHandle}`,
            target: `${setting.target}`,
            targetHandle: `${setting.targetHandle}`,
            type: 'CustomEdge',
            data: {handleType}
        }
    }

    /**
     * Builds an array of Edge objects for Svelte Flow from an array of SettingEventEdge instances.
     * @param eventFlow
     */
    static buildEdges(eventFlow: EventFlow): Edge[] {
        const nodes: IDictionary<AbstractItem> = eventFlow.__children(eventFlow.nodes)

        const settings: IDictionary<AbstractItem> = eventFlow.__children(eventFlow.edges)
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventEdge)
            .map(([id, setting]) => {
                const settingObj = setting as SettingEventEdge

                const itemId = (nodes[settingObj.source] as SettingEventNode).item
                const item = Object.values(eventFlow.__children([itemId])).pop()
                let handleType = Constants.nodeHandleTypes.activate
                if (item && item instanceof AbstractNode) {
                    const meta = item.__meta()
                    const handle = (meta?.handleOutTypes ?? {})[`${settingObj.sourceHandle}`]
                    if (handle) handleType = handle.type
                }

                return this.buildEdge(
                    ValueUtils.ensureNumber(id),
                    handleType,
                    settingObj)
            })
    }

    // region Utils
    static isAbstractNode(obj: unknown): obj is AbstractNode {
        return obj instanceof AbstractNode
    }

    static getColorForType(type: number): string {
        let color = 'gray'
        switch (type) {
            case Constants.nodeHandleTypes.invalid:
                color = 'red'
                break
            case Constants.nodeHandleTypes.activate:
                color = 'yellow'
                break
            case Constants.nodeHandleTypes.audio:
                color = 'orange'
                break
            case Constants.nodeHandleTypes.image:
                color = 'green'
                break
            case Constants.nodeHandleTypes.text:
                color = 'blue'
                break
            case Constants.nodeHandleTypes.number:
                color = 'cyan'
                break
            case Constants.nodeHandleTypes.video:
                color = 'purple'
                break
            default:
                break
        }
        return color
    }

    static getLabelForType(type: number): string {
        let label = ''
        switch (type) {
            case Constants.nodeHandleTypes.invalid:
                label = 'INVALID'
                break
            case Constants.nodeHandleTypes.activate:
                label = 'Activate'
                break
            case Constants.nodeHandleTypes.audio:
                label = 'Audio'
                break
            case Constants.nodeHandleTypes.image:
                label = 'Image'
                break
            case Constants.nodeHandleTypes.text:
                label = 'Text'
                break
            case Constants.nodeHandleTypes.number:
                label = 'Number'
                break
            case Constants.nodeHandleTypes.video:
                label = 'Video'
                break
            default:
                break
        }
        return label
    }

    // endregion
    static areHandleTypesEqual(connection: Connection, eventFlow: EventFlow): boolean {
        const sourceItem = this.getChildFromEvent(connection.source, eventFlow)
        const targetItem = this.getChildFromEvent(connection.target, eventFlow)
        if (!sourceItem || !targetItem) {
            Log.w(this.#tag, 'Item(s) loaded for connection are invalid.', {sourceItem, targetItem})
            return false
        }
        const sourceHandleType = this.getHandleTypeFromItem(connection.sourceHandle, sourceItem.__meta()?.handleOutTypes ?? {})
        const targetHandleType = this.getHandleTypeFromItem(connection.targetHandle, targetItem.__meta()?.handleInTypes ?? {})
        if (sourceHandleType === Constants.nodeHandleTypes.invalid || targetHandleType === Constants.nodeHandleTypes.invalid) {
            Log.w(this.#tag, 'Item node handle type(s) were invalid', {sourceHandleType, targetHandleType})
            return false
        }
        return sourceHandleType === targetHandleType
    }

    static getChildFromEvent(nodeId: any, eventFlow: EventFlow): AbstractItem | undefined {
        const id = ValueUtils.ensureNumber(nodeId)
        const setting = Object.values(eventFlow.__children([id])).pop()
        if (!(setting instanceof SettingEventNode)) return undefined
        const itemId = setting.item
        return Object.values(eventFlow.__children([itemId])).pop()
    }

    static getHandleTypeFromItem(handleId: any, handles: IDictionary<IClassNodeHandle>): number {
        return handles[handleId]?.type ?? Constants.nodeHandleTypes.invalid
    }
}