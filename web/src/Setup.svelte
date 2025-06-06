<script lang="ts">
    import {fade} from 'svelte/transition'
    import type {IDatabaseMessage} from '../../lib/Types/WebSocket/Database.mjs'
    import WebSocketFactory from './Classes/WebSocketFactory.mjs'
    import AuthBarrier from './Components/AuthBarrier.svelte'
    import TopBar from './Components/TopBar.svelte'

    const db = WebSocketFactory.getDatabaseClient()
    db.init()
    const onclick = () => {
        const nonce = db.getNonce()
        const data: IDatabaseMessage = {
            action: 'load',
            nonce,
            key: 'Main',
            group: 'ConfigServer'
        }
        db.sendMessageWithPromise(data, nonce).then((response) => {
            console.log(response)
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
