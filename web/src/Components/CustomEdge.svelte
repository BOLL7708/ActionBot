<script lang="ts">
    import {BaseEdge, EdgeLabel, type EdgeProps, getBezierPath, useEdges, useOnSelectionChange} from '@xyflow/svelte'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import Session from '../Classes/Session.ts'
    import SvelteFlowUtils from '../Classes/SvelteFlowUtils.ts'

    let {id, sourceX, sourceY, targetX, targetY, sourceHandleId, data}: EdgeProps = $props()

    let [path, labelX, labelY] = $derived(
        getBezierPath({
            sourceX,
            sourceY,
            targetX,
            targetY
        })
    )

    let color = $derived(SvelteFlowUtils.getColorForType(ValueUtils.ensureNumber(data?.handleType)))
    let label = $derived(SvelteFlowUtils.getLabelForType(ValueUtils.ensureNumber(data?.handleType)))

    const edges = useEdges()
    const deleteEdge = () => {
        edges.update((eds) => {
            const split = ValueUtils.partition(eds, it => it.id !== id)
            Session.editorOnDelete({nodes: [], edges: split.exclude})
            return split.include
        })
    }

    let strokeWidth = $state(3)
    useOnSelectionChange(({nodes, edges}) => {
        if (edges.map(e => e.id).includes(id)) {
            strokeWidth = 6
        } else {
            strokeWidth = 3
        }
    })
</script>

<BaseEdge {id} {path} style="stroke-width: {strokeWidth}px; stroke: {color};"/>
{#if label.length}
    <EdgeLabel x={labelX} y={labelY}>
        <div class="edge-label">{label}<br/>
            <button onclick={deleteEdge}>🗑️</button>
        </div>
    </EdgeLabel>
{/if}
<style>
    .edge-label button {
        padding: 1px;
        margin: 0;
        background: transparent;
        border-radius: 4px;
    }

    .edge-label button:hover {
        background: red;
    }
</style>