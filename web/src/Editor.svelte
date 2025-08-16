<script lang="ts">
    import {SvelteFlowProvider} from '@xyflow/svelte'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import '@xyflow/svelte/dist/style.css'
    import EditorFlow from './Components/EditorFlow.svelte'
</script>

<AuthBarrier>
    <SvelteFlowProvider>
        <EditorFlow/>
    </SvelteFlowProvider>
</AuthBarrier>