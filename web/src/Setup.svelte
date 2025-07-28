<script lang="ts">
    import {fade} from 'svelte/transition'
    import ItemHelper from '../../lib/Classes/ItemHelper.ts'
    import DatabaseRequest from '../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
    import type DatabaseResponse from '../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
    import {ConfigServer} from '../../lib/Objects/Item/Config/ConfigServer.ts'
    import {ConfigTest} from '../../lib/Objects/Item/Config/ConfigTest.ts'
    import Log from '../../lib/SharedUtils/Log.ts'
    import type {IJsonStore} from '../../lib/Types/Database.ts'
    import ItemRemote from './Classes/ItemRemote.ts'
    import WebSocketClients from './Classes/WebSocketClients.js'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import TopBar from './Components/TopBar.svelte'

    let config: ConfigTest|undefined = $state(undefined)
    let savedRowId: number = $state(-1)
    let deleteCount: number = $state(-1)

    let singleNumber: number = $state(0)
    let singleString: string = $state('')
    let singleBoolean: boolean = $state(false)

    const load = async () => {
        config = await ItemRemote.do.loadMain(ConfigTest)
        singleNumber = config.singleNumber
        singleString = config.singleString
        singleBoolean = config.singleBoolean
    }
    const save = async () => {
        if(config) {
            config.singleNumber = singleNumber
            config.singleString = singleString
            config.singleBoolean = singleBoolean
            savedRowId = await ItemRemote.do.saveMain(config)
        }
    }
    const deleteItem = async () => {
        if(config) {
            const deleteCount = await ItemRemote.do.delete(config.__info().rowId)
        }
    }
</script>

<main transition:fade>
    <AuthBarrier>
        <TopBar>Setup</TopBar>
        <div style="display: flex; flex-direction: column; max-width: 20em;">
        <button onclick={load}>Load</button>
        <button onclick={save}>Save</button>
        <label>Number: <input type="number" bind:value={singleNumber}/></label>
        <label>String: <input type="text" bind:value={singleString}/></label>
        <label>Boolean: <input type="checkbox" bind:checked={singleBoolean}/></label>
        <button onclick={deleteItem}>Delete</button>
        <pre>{JSON.stringify(config, null, 2)}</pre>
        <pre>{savedRowId}</pre>
        <pre>{deleteCount}</pre>
        </div>
    </AuthBarrier>
</main>

<style>
</style>
