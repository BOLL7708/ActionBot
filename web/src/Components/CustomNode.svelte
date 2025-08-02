<script lang="ts">
    // Custom Node
    // https://svelteflow.dev/examples/nodes/custom-node

    import {Handle, Position, useSvelteFlow, type NodeProps} from '@xyflow/svelte'
    import Constants from '../../../lib/Classes/Constants.ts'
    import type {IAbstractNodeHandle} from '../../../lib/Objects/Item/AbstractNode.ts'
    import SvelteFlowUtils from '../Classes/SvelteFlowUtils.ts'

    let {id, data, isConnectable}: NodeProps = $props() // Grab things from the SvelteFlow system
    let {updateNodeData} = useSvelteFlow() // TODO: Perform this after an editor has been dismissed.
    const topHandles = (data.topHandles ??  []) as IAbstractNodeHandle[]
    const bottomHandles = (data.bottomHandles ??  []) as IAbstractNodeHandle[]
    const handleMargin = 33
    const getPos = (index: number, source: unknown[]): number => handleMargin+(index/(source.length-1)*(100-handleMargin*2))
</script>

<div style="display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: row;">
        <button>✏️</button>
        <p>{data.title}</p>
        <button>🗑️</button>
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