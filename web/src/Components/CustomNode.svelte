<script lang="ts">
    // Custom Node
    // https://svelteflow.dev/examples/nodes/custom-node

    import {Handle, type NodeProps, Position, useEdges, useNodes, useSvelteFlow} from '@xyflow/svelte'
    import type {IAbstractNodeHandle} from '../../../lib/Objects/Item/AbstractNode.ts'
    import SvelteFlowUtils from '../Classes/SvelteFlowUtils.ts'

    let {id, data, isConnectable}: NodeProps = $props() // Grab things from the SvelteFlow system
    let {updateNodeData} = useSvelteFlow() // TODO: Perform this after an editor has been dismissed?
    const topHandles = (data.topHandles ?? []) as IAbstractNodeHandle[]
    const bottomHandles = (data.bottomHandles ?? []) as IAbstractNodeHandle[]
    const handleMargin = 33
    const getPos = (index: number, source: unknown[]): number => handleMargin + (index / (source.length - 1) * (100 - handleMargin * 2))

    const nodes = useNodes()
    const edges = useEdges()

    /**
     * https://svelteflow.dev/examples/edges/custom-edges
     * @param _ev
     */
    const deleteNode = (_ev: MouseEvent | TouchEvent) => {
        // TODO: Make a setting to disable this prompt (or rather all prompts)
        const doIt = confirm('Are you sure you want to delete this node?')
        if (!doIt) return
        nodes.update((nds) => nds.filter((node) => node.id !== id))
        edges.update((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
    }
    /**
     * https://svelteflow.dev/examples/nodes/update-node
     * @param _ev
     */
    const editData = (_ev: MouseEvent | TouchEvent) => {
        // TODO: This should launch a modal with a full on JSON data editor
        const value = prompt('Change the value of the node!')
        nodes.set(nodes.current.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: value
                    }
                }
            }
            return node
        }))
    }
</script>

<div style="display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: row;">
        <button onclick={editData}>✏️</button>
        <p>{data.title}</p>
        <button onclick={deleteNode}>🗑️</button>
    </div>
    <p>{data.label}</p>

</div>
{#each topHandles as handle, i}
    <Handle type="target"
            position={Position.Top}
            {isConnectable}
            id={`${handle.type}`}
            style="left: {getPos(i, topHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};"/>
{/each}
{#each bottomHandles as handle, i}
    <Handle type="source"
            position={Position.Bottom}
            {isConnectable}
            id={`${handle.type}`}
            style="left: {getPos(i, bottomHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};"/>
{/each}