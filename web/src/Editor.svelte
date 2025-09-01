<script lang="ts">
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import '@xyflow/svelte/dist/style.css'
    import EditorJson from './Components/EditorJson.svelte'
</script>

<AuthBarrier>
    <EditorJson itemId="0"></EditorJson>
</AuthBarrier>