<script lang="ts">
    import {BaseEdge, EdgeLabel, type EdgeProps, getBezierPath, useEdges} from '@xyflow/svelte'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import Session from '../Classes/Session.ts'
    import SvelteFlowUtils from '../Classes/SvelteFlowUtils.ts'

    let {id, sourceX, sourceY, targetX, targetY, sourceHandleId}: EdgeProps = $props()

    let [path, labelX, labelY] = $derived(
        getBezierPath({
            sourceX,
            sourceY,
            targetX,
            targetY
        })
    )

    let color = $derived(SvelteFlowUtils.getColorForType(ValueUtils.ensureNumber(sourceHandleId)))
    let label = $derived(SvelteFlowUtils.getLabelForType(ValueUtils.ensureNumber(sourceHandleId)))

    const edges = useEdges()
    const deleteEdge = () => {
        edges.update((eds) => {
            const split = ValueUtils.partition(eds, it => it.id !== id)
            Session.editorOnDelete({nodes: [], edges: split.exclude})
            return split.include
        })
    }
</script>

<BaseEdge {id} {path} style="stroke: {color};"/>
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