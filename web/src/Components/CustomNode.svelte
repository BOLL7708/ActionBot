<script lang="ts">
    // Custom Node
    // https://svelteflow.dev/examples/nodes/custom-node

    import {Position, useSvelteFlow, type NodeProps} from '@xyflow/svelte'

    let {id, data}: NodeProps = $props()
    let {updateNodeData} = useSvelteFlow()
</script>

<div class="text-updater-node">
    <div>
        <h1>Title</h1>
        <button/>
        <label for="text">Text:</label>
        <button/>
    </div>
</div>