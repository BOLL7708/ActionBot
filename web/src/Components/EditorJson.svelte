<script lang="ts">
    import {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
    import {type IItemMeta, ItemMap} from '../../../lib/Objects/ItemMap.ts'
    import Log from '../../../lib/SharedUtils/Log.ts'
    import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
    import ItemRemote from '../Classes/ItemRemote.ts'
    import SvelteUtils from '../Classes/SvelteUtils.ts'

    const tag = SvelteUtils.tag(import.meta.url)

    const {itemId} = $props()
    let itemData = $state<AbstractItem|undefined>(undefined)
    let itemMeta = $state<IItemMeta|undefined>(undefined)
    let status = $state('')

    ;(async () => {
        status = ''
        itemData = await ItemRemote.do.loadById<AbstractItem>(itemId)
        if(itemData) {
            Log.d(tag, 'itemData', itemData, itemData.__meta())
            itemMeta = itemData.__meta()
        } else {
            status = 'Could not load data.'
            Log.e(tag, `Could not load itemData for ${itemId}`)
        }
    })()
</script>
<div>
    <!--
    TODO: Build the JSON editor here, it should work as a dialog, as a secondary editor, on a page, an isolated editor but with hooks to react to outside events.
        Editing a sub-item should append another editor at the bottom, if that sub-item is removed the editor should automatically close.


    -->
    {#if ValueUtils.isNotBlank(status)}
        <span>WARNING: {status}</span>
    {/if}
    <span>Json Editor</span>
    <pre>{JSON.stringify(itemData, null, 2)}</pre>
    <pre>{JSON.stringify(itemMeta, null, 2)}</pre>
    <form>
        <button formmethod="dialog">Close</button>
    </form>
</div>