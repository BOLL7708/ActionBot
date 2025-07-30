import {type Edge, type Node} from '@xyflow/svelte'
import type {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
import SettingEventEdge from '../../../lib/Objects/Item/Setting/SettingEventEdge.ts'
import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
import type {IDictionary} from '../../../lib/SharedUtils/Dictionary.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'

export default class SvelteFlowUtils {
    /**
     * Builds a Node object for Svelte Flow from a SettingEventNode instance.
     * @param id
     * @param setting
     */
    static buildNode(id: number, setting: SettingEventNode): Node {
        return {
            id: `id-${id}`,
            position: {x: setting.xPos, y: setting.yPos},
            data: {},
            type: 'customNode',
            style: 'background-color: red;'
        }
    }

    /**
     * Builds an array of Node objects for Svelte Flow from an array of SettingEventNode instances.
     * @param settings
     */
    static buildNodes(settings: IDictionary<AbstractItem>): Node[] {
        console.log({settings})
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventNode)
            .map(([id, setting]) =>
                this.buildNode(ValueUtils.ensureNumber(id), setting as SettingEventNode)
            )
    }

    /**
     * Builds an Edge object for Svelte Flow from a SettingEventEdge instance.
     * @param id
     * @param setting
     */
    static buildEdge(id: number, setting: SettingEventEdge): Edge {
        return {
            id: `id-${id}`,
            source: `id-${setting.source}`,
            target: `id-${setting.target}`
        }
    }

    /**
     * Builds an array of Edge objects for Svelte Flow from an array of SettingEventEdge instances.
     * @param settings
     */
    static buildEdges(settings: IDictionary<AbstractItem>): Edge[] {
        return Object.entries(settings)
            .filter(([_id, setting]) => setting instanceof SettingEventEdge)
            .map(([id, setting]) =>
                this.buildEdge(ValueUtils.ensureNumber(id), setting as SettingEventEdge)
            )
    }
}