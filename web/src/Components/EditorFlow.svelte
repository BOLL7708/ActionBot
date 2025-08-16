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
    import SvelteUtils from "../Classes/SvelteUtils.ts";

    const tag = SvelteUtils.tag(import.meta.url)

    const {screenToFlowPosition} = useSvelteFlow()
    let nodes: Node[] = $state.raw([])
    let edges: Edge[] = $state.raw([])

    const eventKey = 'TestEvent' // TODO: This should be loaded from Session, or URL param, or picked from the menu.
    let eventFlow: EventFlow | undefined
    let eventFlowId: number = -1

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
        Session.colorMode = colorMode // TODO: Should this be a callback or something? Maybe a registration of listeners?
    })
    // endregion

    const nodeTypes = {
        CustomNode
    }

    const edgeTypes = {
        CustomEdge
    }

    /** Filters if a connection is valid to make or not */
    const isValidConnection: IsValidConnection = (connection) => {
        if (!eventFlow) return false
        return SvelteFlowUtils.areHandleTypesEqual(connection as Connection, eventFlow) // TODO: Not sure if this matters, I think the EdgeBase class includes the same properties and more, but it fails to import.
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
        Log.i(tag, 'doCreateNode->input', type, xPos, yPos)
        const item = ItemHelper.recreateSimple(type)
        const constructor = ItemMap.get(type)?.classConstructor
        if (constructor && item && item instanceof AbstractNode) {
            const newNodeSetting = new SettingEventNode()
            newNodeSetting.xPos = xPos
            newNodeSetting.yPos = yPos
            const nodeId = await ItemRemote.do.save(newNodeSetting, eventFlowId) // CREATE NODE WITH EVENT PARENT

            const itemId = await ItemRemote.do.save(item, nodeId) // CREATE ITEM WITH NODE PARENT
            newNodeSetting.item = itemId
            Log.v(tag, 'doCreateNode->item', {itemId})
            await ItemRemote.do.save(newNodeSetting, eventFlowId, nodeId) // UPDATE NODE WITH ITEM

            let eventResult: number = 0
            if (eventFlow) {
                eventFlow.nodes.push(nodeId)
                eventResult = await ItemRemote.do.save(eventFlow, eventKey) // UPDATE EVENT WITH NODE
            }
            if (eventResult !== eventFlowId) Log.e(tag, `doCreateNode: Saving the event did not return the right ID (${eventResult} !== ${eventFlowId})`)

            const itemWithInfo = await ItemRemote.do.load(constructor, itemId)
            const settingWithInfo = await ItemRemote.do.load(SettingEventNode, nodeId)
            const newNode = SvelteFlowUtils.buildNodeFromItem(itemWithInfo, settingWithInfo)
            nodes = [...nodes, newNode] // PUBLISH NODE TO EDITOR
        }
    }
    Session.editorDoCreateNode = doCreateNode

    /**
     * Was detecting creation of edges to add them to the DB, is now used by the override of said edge creation.
     * Adds the edge to the database and updates the editor.
     * @param connection
     */
    const onConnect = async (connection: Connection) => {
        Log.i(tag, 'onConnect->input', connection)
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
        if (eventFlow) {
            eventFlow.edges.push(newEdgeId)
            eventResult = await ItemRemote.do.save(eventFlow, eventKey)
            const sourceItem = SvelteFlowUtils.getChildFromEvent(connection.source, eventFlow)
            const sourceHandleType = SvelteFlowUtils.getHandleTypeFromItem(connection.sourceHandle, sourceItem?.__meta()?.handleOutTypes ?? {})
            const newEdge = SvelteFlowUtils.buildEdge(newEdgeId, sourceHandleType, newEdgeSetting)
            edges = [...edges, newEdge]
        }
        Log.i(tag, 'onConnect->done', {eventResult})
    }
    /**
     * Overrides the edge creation by returning false
     * TODO: which currently generates a type error, reported on Discord.
     * [Documentation](https://svelteflow.dev/api-reference/types/on-before-connect)
     * @param connection
     */
    const onBeforeConnect = (connection: Connection): void | Edge | Connection | false => {
        onConnect(connection)
        return false
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
            if (result !== id) Log.w(tag, `onNodeDragStop: ID from saving node (${result}) did not match incoming id (${id}).`)
        }
    }
    /**
     * Detects all manners of deletions, which means the referenced items should be removed from the database.
     * @param params
     */
    const onDelete: OnDelete = async (params) => {
        const nodeIds = params.nodes.map(it => ValueUtils.ensureNumber(it.id))
        const edgeIds = params.edges.map(it => ValueUtils.ensureNumber(it.id))
        Log.i(tag, 'onDelete->input', {nodeIds, edgeIds})
        const deleteResult = await ItemRemote.do.delete([...nodeIds, ...edgeIds])
        let eventResult: number = 0
        if (eventFlow) {
            Log.v(tag, 'onDelete->event', {nodes: eventFlow.nodes, edges: eventFlow.edges})
            eventFlow.edges = eventFlow.edges.filter(edge => !edgeIds.includes(edge))
            eventFlow.nodes = eventFlow.nodes.filter(node => !nodeIds.includes(node))
            eventResult = await ItemRemote.do.save(eventFlow, eventKey)
        }
        Log.i(tag, 'onDelete->done', {deleteResult, eventResult})
    }
    Session.editorOnDelete = onDelete

    // $inspect(edges).with(console.trace)
    $effect(() => {
        Log.w(tag, 'Edges updated', edges)
    })

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

            onbeforeconnect={onBeforeConnect}
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