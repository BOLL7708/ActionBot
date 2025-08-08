<script lang="ts">
    // Custom Node
    // https://svelteflow.dev/examples/nodes/custom-node

    import {
        Handle,
        type NodeProps,
        Position,
        useEdges,
        useNodes,
        useOnSelectionChange,
        useSvelteFlow
    } from '@xyflow/svelte'
    import type {IAbstractNodeHandle} from '../../../lib/Objects/Item/AbstractNode.ts'
    import Session from '../Classes/Session.ts'
    import SvelteFlowUtils from '../Classes/SvelteFlowUtils.ts'

    let {id, data, isConnectable}: NodeProps = $props() // Grab things from the SvelteFlow system
    const topHandles = (data.topHandles ?? []) as IAbstractNodeHandle[]
    const bottomHandles = (data.bottomHandles ?? []) as IAbstractNodeHandle[]
    let {updateNodeData, deleteElements} = useSvelteFlow()
    const handleMargin = 33
    const getPos = (index: number, source: unknown[]): number => handleMargin + (index / (source.length - 1) * (100 - handleMargin * 2))

    let borderColor = $state('transparent')
    useOnSelectionChange(({nodes, edges}) => {
        if (nodes.map(n => n.id).includes(id)) {
            borderColor = 'green'
        } else {
            borderColor = 'transparent'
        }
    })

    /**
     * https://svelteflow.dev/examples/edges/custom-edges
     * @param _ev
     */
    const deleteNode = async (_ev: MouseEvent | TouchEvent) => {
        // TODO: Make a setting to disable this prompt (or rather all prompts I guess)
        const doIt = confirm('Are you sure you want to delete this node the edges connected to it, and the associated data?')
        if (!doIt) return
        const deleted = await deleteElements({nodes: [{id}]})
        Session.editorOnDelete({nodes: deleted.deletedNodes, edges: deleted.deletedEdges})
    }
    /**
     * https://svelteflow.dev/examples/nodes/update-node
     * @param _ev
     */
    const editData = (_ev: MouseEvent | TouchEvent) => {
        // TODO: This should launch a modal with a full on JSON data editor
        const value = prompt('Change the value of the node!')
        updateNodeData(id, {label: value}) // TODO: Value here should be the __nodeText() of the data item.
    }
</script>

<div style="display: flex; flex-direction: column; border: 6px solid {borderColor};">
    <div style="display: flex; flex-direction: row;">
        <button onclick={editData}>✏️</button>
        <p>{data.title}</p>
        <button onclick={deleteNode}>🗑️</button>
    </div>
    <pre>{data.label}</pre>
</div>
{#each topHandles as handle, i}
    <Handle type="target"
            position={Position.Top}
            {isConnectable}
            id={`${handle.type}`}
            style="left: {getPos(i, topHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};">
        <span>{handle.label}</span><!-- TODO: Fix this so the labels all fit and are rotated out from the node. -->
    </Handle>
{/each}
{#each bottomHandles as handle, i}
    <Handle type="source"
            position={Position.Bottom}
            {isConnectable}
            id={`${handle.type}`}
            style="left: {getPos(i, bottomHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};"/>
{/each}