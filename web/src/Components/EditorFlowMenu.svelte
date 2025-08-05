<script lang="ts">
    import {ItemMap} from '../../../lib/Objects/ItemMap.ts'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import Session from '../Classes/Session.ts'

    const triggers = ItemMap.getRange('Trigger')
    const actions = ItemMap.getRange('Action')

    const onDragStart = (event: DragEvent, nodeType: string) => {
        if (!event.dataTransfer) {
            return null
        }
        Session.editorFlowDragAndDropType = nodeType
        event.dataTransfer.effectAllowed = 'move'
    }
</script>

<div>
    <p>Triggers</p>
    <ul>
        {#each Object.keys(triggers) as trigger}
            <li
                    on:dragstart={(event) => onDragStart(event, trigger)}
                    draggable={true}
            >{ValueUtils.removeFirstWord(trigger)}</li>
        {/each}
    </ul>
    <p>Actions</p>
    <ul>
        {#each Object.keys(actions) as action}
            <li
                    on:dragstart={(event) => onDragStart(event, action)}
                    draggable={true}
            >{ValueUtils.removeFirstWord(action)}</li>
        {/each}
    </ul>
</div>