<script lang="ts">
    import {SvelteFlowProvider} from '@xyflow/svelte'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import '@xyflow/svelte/dist/style.css'
    import EditorFlow from './Components/EditorFlow.svelte'

    /*
    TODO
     1. Pick the most important properties of the nodes and edges and make a method
     on the items that will output these values to create custom nodes and edges.
     2. A custom node requires a custom Svelte component, ideally we only have one
     of these and feed it data through properties to show what we need it to.
     3. Figure out how to store the node and edge data to the database and then
     retrieve it and apply it to the node flow editor.
     */

    // region Nodes & Edges

    /*
    TODO
     Create a storage format for nodes in an Event object.
     Then load that event object and fill these lists of nodes and edges.
    */
</script>

<AuthBarrier>
    <SvelteFlowProvider>
        <EditorFlow/>
    </SvelteFlowProvider>
</AuthBarrier>