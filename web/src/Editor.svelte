<script lang="ts">
    import {
        SvelteFlow,
        Background,
        Controls,
        MiniMap,
        Panel,
        type Node,
        type Edge,
        type ColorMode,
        SvelteFlowProvider
    } from '@xyflow/svelte'
    import ItemHelper from '../../lib/Classes/ItemHelper.ts'
    import {ConfigServer} from '../../lib/Objects/Item/Config/ConfigServer.ts'
    import EventFlow from '../../lib/Objects/Item/Event/EventFlow.ts'
    import SettingEventEdge from '../../lib/Objects/Item/Setting/SettingEventEdge.ts'
    import SettingEventNode from '../../lib/Objects/Item/Setting/SettingEventNode.ts'
    import ItemRemote from './Classes/ItemRemote.ts'
    import SvelteFlowUtils from './Classes/SvelteFlowUtils.ts'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import '@xyflow/svelte/dist/style.css'
    import CustomNode from './Components/CustomNode.svelte'

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

    let nodes: Node[] = $state.raw([])
    let edges: Edge[] = $state.raw([])

    ;(async()=>{
        const db = ItemRemote.do
        // const test = await db.loadMain(ConfigServer)
        // console.log({test})

        // region Delete & restart
        // We delete and restart everything due to rapidly changing code.

        const eventKey = 'TestEvent'

        let eventFlow = await db.load(EventFlow, eventKey)
        let eventId = eventFlow.__info().rowId
        await db.delete(eventId)

        eventFlow = new EventFlow()
        eventId = await db.save(eventFlow, eventKey)
        // endregion

        // region Create nodes & edges
        const node1 = new SettingEventNode()
        const node1id = await db.save(node1, eventId)

        const node2 = new SettingEventNode()
        node2.xPos = -50
        node2.yPos = 150
        const node2id = await db.save(node2, eventId)

        const node3 = new SettingEventNode()
        node3.xPos = 50
        node3.yPos = 300
        const node3id = await db.save(node3, eventId)

        const edge1 = new SettingEventEdge()
        edge1.source = node1id
        edge1.target = node2id
        const edge1id = await db.save(edge1, eventId)

        const edge2 = new SettingEventEdge()
        edge2.source = node2id
        edge2.target = node3id
        const edge2id = await db.save(edge2, eventId)

        eventFlow.nodes = [node1id, node2id, node3id]
        eventFlow.edges = [edge1id, edge2id]
        await db.save(eventFlow, eventKey)
        // endregion

        eventFlow = await db.load(EventFlow, eventKey)

        nodes = SvelteFlowUtils.buildNodes(eventFlow.__children(eventFlow.nodes))
        edges = SvelteFlowUtils.buildEdges(eventFlow.__children(eventFlow.edges))

        // endregion
    })()


    // region Dark Mode
    // https://svelteflow.dev/examples/styling/dark-mode
    let colorMode: ColorMode = $state('system')
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        colorMode = event.matches ? 'dark' : 'light'
    })
    // endregion

    const nodeTypes = {customNode: CustomNode}
</script>

<AuthBarrier>
    <SvelteFlowProvider>
        <main>
            <div>
                <ul>
                    <li>TriggerTimer</li>
                    <li>TriggerChat</li>
                    <li>TriggerCommand</li>
                </ul>
            </div>
            <div style:flex="max-content">
                <SvelteFlow bind:nodes bind:edges {colorMode} {nodeTypes} fitView>
                    <Background/>
                    <Controls/>
                    <MiniMap/>
                </SvelteFlow>
            </div>
        </main>
    </SvelteFlowProvider>
</AuthBarrier>
<style>
    main {
        height: 100vh;
        display: flex;
        flex-direction: row;
    }
</style>