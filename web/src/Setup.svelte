<script lang="ts">
    import './Classes/AbstractDataRunner.ts'
    import {fade} from 'svelte/transition'
    import DatabaseRequest from '../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
    import type DatabaseResponse from '../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
    import {ConfigServer} from '../../lib/Objects/Data/Config/ConfigServer.ts'
    import Log from '../../lib/SharedUtils/Log.ts'
    import ValueUtils from '../../lib/SharedUtils/ValueUtils.js'
    import type {IDatabaseItem} from '../../lib/Types/DatabaseHelper.ts'
    import WebSocketFactory from './Classes/WebSocketFactory.js'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import TopBar from './Components/TopBar.svelte'

    const db = WebSocketFactory.getDatabaseClient()
    db.init()
    const onclick = () => {
        const request = new DatabaseRequest()
        request.action = 'load'
        request.messageId = db.getNextMessageId()
        request.groupKey = 'Main'
        request.groupClass = ConfigServer.ref.build()
        db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId).then(async (response) => {
            Log.d('Setup', 'PromiseResolved', response)
            if(response) {
                const jsonStr = ValueUtils.safeBase64Decode(response.dataJsonBase64)
                const jsonObj = ValueUtils.safeJsonParse<IDatabaseItem<any>>(jsonStr)
                Log.d('Setup', 'RestoredItem', {jsonObj})
                if(jsonObj) {
                    const configServer = await new ConfigServer().__applyAsync(jsonObj.data, true)
                    console.log('Reinstantiated object:', configServer)
                }
            }
        })
    }
</script>

<main transition:fade>
    <AuthBarrier>
        <TopBar>Setup</TopBar>
        <button {onclick}>Test</button>
    </AuthBarrier>
</main>

<style>
</style>
