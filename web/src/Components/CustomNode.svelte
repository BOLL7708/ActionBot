<script lang="ts">
    // Custom Node
    // https://svelteflow.dev/examples/nodes/custom-node

    import {Handle, type NodeProps, Position, useOnSelectionChange, useSvelteFlow} from '@xyflow/svelte'
    import type {AbstractNode} from '../../../lib/Objects/Item/AbstractNode.ts'
    import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import ItemRemote from '../Classes/ItemRemote.ts'
    import Session from '../Classes/Session.ts'
    import SvelteFlowUtils, {type ISvelteNodeProps} from '../Classes/SvelteFlowUtils.ts'
    import EditorJson from './EditorJson.svelte'

    let {id, data, isConnectable}: NodeProps = $props() // Grab things from the SvelteFlow system
    const typedData = data as ISvelteNodeProps
    const inHandles = (typedData.inHandles ?? [])
    const outHandles = (typedData.outHandles ?? [])
    let {updateNodeData, deleteElements} = useSvelteFlow()
    const getPosAsPercent = (index: number, source: unknown[]): number => (index + 1) / (source.length + 1) * 100
    let dialogIsShown = $state(false)
    let borderColor = $state('transparent')
    let itemId = $state(0)
    useOnSelectionChange(({nodes, edges}) => {
        if (nodes.map(n => n.id).includes(id)) {
            borderColor = 'green' // TODO: Perhaps make this more universal than one specific color? Not sure if we can blend it or detect dark mode.
        } else {
            borderColor = 'transparent'
        }
    })

    /**
     * https://svelteflow.dev/examples/edges/custom-edges
     * @param _ev
     */
    const deleteNode = async (_ev: MouseEvent | TouchEvent) => {
        // TODO: Make a setting to disable this prompt (or rather all prompts I guess)
        const doIt = confirm('Are you sure you want to delete this node the edges connected to it, and the associated data?')
        if (!doIt) return
        const deleted = await deleteElements({
            nodes: [
                {id}
            ]
        })

        /*
        TODO: This should not be required after 1.2.4 but I still need to use it?
         Link: https://discord.com/channels/771389069270712320/1401918968972836886
        */
        Session.editorOnDelete({nodes: deleted.deletedNodes, edges: deleted.deletedEdges})
    }
    /**
     * https://svelteflow.dev/examples/nodes/update-node
     * @param _ev
     */
    const editData = async (_ev: MouseEvent | TouchEvent) => {
        const settingItem = await ItemRemote.do.loadById<SettingEventNode>(ValueUtils.ensureNumber(data.id))
        if (settingItem) {
            itemId = settingItem.item
            Session.toggleInput(false)
            dialogEditor.showModal()
            dialogIsShown = true

            dialogEditor.onclose = async () => {
                dialogIsShown = false
                Session.toggleInput(true)
                const updatedItem = await ItemRemote.do.loadById<AbstractNode>(itemId)
                if(updatedItem) {
                    updateNodeData(id, {label: updatedItem.__nodeText()})
                } else {
                    alert('Could not load the updated item, something must have gone wrong, please reload the page.')
                }
            }
        } else {
            alert('Could not load data for this node, it might have been deleted in a conflicting session, please reload the page.')
        }
    }
    let dialogEditor: HTMLDialogElement

    const stopPropagation = (e: Event) => { e.stopPropagation() }

</script>

<div style="display: flex; flex-direction: column; border: 6px solid {borderColor};">
    <div style="display: flex; flex-direction: row;">
        <button onclick={editData}>✏️</button>
        <p>{typedData.title}</p>
        <button onclick={deleteNode}>🗑️</button>
    </div>
    <pre>{typedData.label}</pre>
</div>
{#each inHandles as handle, i}
    <Handle type="target"
            position={Position.Left}
            {isConnectable}
            id={`${handle.id}`}
            style="top: {getPosAsPercent(i, inHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};">
        <span>{handle.label}</span><!-- TODO: Fix this so the labels all fit and are rotated out from the node. -->
    </Handle>
{/each}
{#each outHandles as handle, i}
    <Handle type="source"
            position={Position.Right}
            {isConnectable}
            id={`${handle.id}`}
            style="top: {getPosAsPercent(i, outHandles)}%; background: {SvelteFlowUtils.getColorForType(handle.type)};"/>
{/each}

<dialog bind:this={dialogEditor} onwheel={stopPropagation}>
    {#if dialogIsShown}
        <EditorJson {itemId}></EditorJson>
    {/if}
</dialog>