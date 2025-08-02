<script lang="ts">
    import {BaseEdge, type EdgeProps, getBezierPath} from '@xyflow/svelte'

    let {id, sourceX, sourceY, targetX, targetY, data}: EdgeProps = $props()

    let [path] = $derived(
        getBezierPath({
            sourceX,
            sourceY,
            targetX,
            targetY
        })
    )
</script>

<BaseEdge {id} {path} style="stroke: {data?.color};"/>