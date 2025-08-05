<script lang="ts">
    import {
        Background,
        type ColorMode,
        type Connection,
        Controls,
        type DefaultEdgeOptions,
        type Edge,
        type IsValidConnection,
        MiniMap,
        type Node,
        type NodeTargetEventWithPointer,
        type OnDelete,
        Panel,
        SvelteFlow,
        useSvelteFlow
    } from '@xyflow/svelte'
    import ItemHelper from '../../../lib/Classes/ItemHelper.ts'
    import {AbstractNode} from '../../../lib/Objects/Item/AbstractNode.ts'
    import {EventFlow} from '../../../lib/Objects/Item/Event/EventFlow.ts'
    import SettingEventEdge from '../../../lib/Objects/Item/Setting/SettingEventEdge.ts'
    import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
    import {ItemMap} from '../../../lib/Objects/ItemMap.ts'
    import Log from '../../../lib/SharedUtils/Log.ts'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import ItemRemote from '../Classes/ItemRemote.ts'
    import Session, {type DoCreateNode} from '../Classes/Session.ts'
    import SvelteFlowUtils, {type ISvelteNodeProps} from '../Classes/SvelteFlowUtils.ts'
    import CustomEdge from './CustomEdge.svelte'
    import CustomNode from './CustomNode.svelte'
    import EditorFlowMenu from './EditorFlowMenu.svelte'

    const {screenToFlowPosition} = useSvelteFlow()
    let nodes: Node[] = $state.raw([])
    let edges: Edge[] = $state.raw([])

    const eventKey = 'TestEvent' // TODO: This should be loaded from Session, or URL param, or picked from menu.
    let eventFlow: EventFlow | undefined
    let eventFlowId: number = -1

        /*
        TODO: Build utilities to handle the syncing of nodes to the DB and editor
         1. Load an EventFlow object
         2. Retain the list of nodes and edges inside the EventFlow object
         3. Create and delete nodes and edges as they are added and removed
        */

    ;(async () => {
        eventFlow = await ItemRemote.do.load(EventFlow, eventKey)
        eventFlowId = eventFlow.__info().rowId
        nodes = SvelteFlowUtils.buildNodes(eventFlow)
        edges = SvelteFlowUtils.buildEdges(eventFlow)
    })()

    // region Dark Mode
    // https://svelteflow.dev/examples/styling/dark-mode
    let colorMode: ColorMode = $state('system')
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        colorMode = event.matches ? 'dark' : 'light'
    })
    // endregion

    const nodeTypes = {
        CustomNode
    }

    const edgeTypes = {
        CustomEdge
    }

    const isValidConnection: IsValidConnection = (connection) => {
        return connection.sourceHandle === connection.targetHandle
    }

    const nodeColor = (node: Node): string => (node.data as ISvelteNodeProps).color

    const defaultEdgeOptions: DefaultEdgeOptions = {
        type: 'CustomEdge'
    }

    const onDragOver = (event: DragEvent) => {
        event.preventDefault()
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move'
        }
    }
    const onDrop = async (event: DragEvent) => {
        event.preventDefault()
        const type = Session.editorFlowDragAndDropType
        if (ValueUtils.isBlank(type)) return

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        })

        Session.editorDoCreateNode(type, position.x, position.y)
    }

    /**
     * Triggered by drag & drop, will create a new node in the database with an associated data item,
     * add the node ID to the event, and add the node to the editor.
     * @param type
     * @param xPos
     * @param yPos
     */
    const doCreateNode: DoCreateNode = async (type, xPos, yPos) => {
        console.log('doCreateNode', type, xPos, yPos)
        /*
         1. CREATE NODE WITH EVENT PARENT
         2. CREATE ITEM WITH NODE PARENT
         3. UPDATE NODE WITH ITEM
         4. UPDATE EVENT WITH NODE
         5. PUBLISH NODE TO EDITOR
         */
        const item = ItemHelper.recreateSimple(type)
        const constructor = ItemMap.get(type)?.classConstructor
        if (constructor && item && item instanceof AbstractNode) {
            const newNodeSetting = new SettingEventNode()
            newNodeSetting.xPos = xPos
            newNodeSetting.yPos = yPos
            const nodeId = await ItemRemote.do.save(newNodeSetting, eventFlowId) // 1

            const itemId = await ItemRemote.do.save(item, nodeId) // 2
            newNodeSetting.item = itemId
            console.log('doCreateNode', {itemId})
            await ItemRemote.do.save(newNodeSetting, eventFlowId, nodeId) // 3

            let eventResult: number = 0
            if (eventFlow) {
                eventFlow.nodes.push(nodeId)
                eventResult = await ItemRemote.do.save(eventFlow, eventKey) // 4
            }
            if(eventResult !== eventFlowId) Log.d('EditorFlow', 'Saving the event did not return the right ID.')

            const itemWithInfo = await ItemRemote.do.load(constructor, itemId)
            const settingWithInfo = await ItemRemote.do.load(SettingEventNode, nodeId)
            const newNode = SvelteFlowUtils.buildNodeFromItem(itemWithInfo, settingWithInfo)
            nodes = [...nodes, newNode] // 5
        }
    }
    Session.editorDoCreateNode = doCreateNode

    /**
     * Detects new edge creation, means it should be added to the database.
     * @param connection
     */
    const onConnect = async (connection: Connection) => {
        console.log('onConnect', connection)
        const newEdgeSetting = new SettingEventEdge()

        // Even if we could run __apply() here, I don't want to _not_ reference
        // property names just for things to break if we refactor anything
        // or the library changes their names of properties. We need warnings!
        newEdgeSetting.source = ValueUtils.ensureNumber(connection.source)
        newEdgeSetting.sourceHandle = ValueUtils.ensureNumber(connection.sourceHandle)
        newEdgeSetting.target = ValueUtils.ensureNumber(connection.target)
        newEdgeSetting.targetHandle = ValueUtils.ensureNumber(connection.targetHandle)

        const newEdgeId = await ItemRemote.do.save(newEdgeSetting, eventFlowId)
        let eventResult: number = 0
        if(eventFlow) {
            eventFlow.edges.push(newEdgeId)
            eventResult = await ItemRemote.do.save(eventFlow, eventKey)
        }
        console.log('onConnect', {eventResult})

        const newEdge = SvelteFlowUtils.buildEdge(newEdgeId, newEdgeSetting)
        edges = [...edges, newEdge]
    }
    /**
     * Detect the end of node movement, which means it should be updated in the database.
     * @param ev
     */
    const onNodeDragStop: NodeTargetEventWithPointer<MouseEvent | TouchEvent> = async (ev) => {
        const flowNode = ev.targetNode
        if (flowNode) {
            const id = ValueUtils.ensureNumber(flowNode.id) // Should match the database ID
            const eventNode = await ItemRemote.do.load(SettingEventNode, id)
            eventNode.xPos = flowNode.position.x
            eventNode.yPos = flowNode.position.y
            const result = await ItemRemote.do.save(eventNode, eventFlowId, id)
            if(result !== id) Log.w('EditorFlow', `ID from saving node (${result}) did not match incoming id (${id}).`)
        }
    }
    /**
     * Detects all manners of deletions, which means the referenced items should be removed from the database.
     * @param params
     */
    const onDelete: OnDelete = async (params) => {
        const nodeIds = params.nodes.map(it => ValueUtils.ensureNumber(it.id))
        const edgeIds = params.edges.map(it => ValueUtils.ensureNumber(it.id))
        const deleteResult = await ItemRemote.do.delete([...nodeIds, ...edgeIds])
        let eventResult: number = 0
        if (eventFlow) {
            console.log('onDelete', {nodeIds, edgeIds, nodes: eventFlow.nodes, edges: eventFlow.edges})
            eventFlow.edges = eventFlow.edges.filter(edge => !edgeIds.includes(edge))
            eventFlow.nodes = eventFlow.nodes.filter(node => !nodeIds.includes(node))
            eventResult = await ItemRemote.do.save(eventFlow, eventKey)
        }
        console.log('onDelete', {deleteResult, eventResult})
    }
    Session.editorOnDelete = onDelete

    const showHelpModal = () => {
        // Show modal dialog that displays help information?
        // or should it be on screen text? 🤔
    }
</script>

<div style:width="100vw" style:height="100vh">
    <SvelteFlow
            bind:nodes
            bind:edges

            {colorMode}
            {nodeTypes}
            {edgeTypes}
            {defaultEdgeOptions}
            {isValidConnection}
            fitView

            ondragover={onDragOver}
            ondrop={onDrop}

            onconnect={onConnect}
            onnodedragstop={onNodeDragStop}
            ondelete={onDelete}
    >
        <Background/>
        <Controls/>
        <MiniMap {nodeColor}/>

        <!-- https://svelteflow.dev/api-reference/components/panel -->
        <Panel position="top-left">
            <EditorFlowMenu/>
        </Panel>
        <Panel position="top-right">
            <button onclick={showHelpModal}>Help</button>
        </Panel>
    </SvelteFlow>
</div>