<script setup lang="ts">

import Log, {EEasyDebugLogLevel} from '../../lib/SharedUtils/Log.mts'
import WebSocketFactory from './classes/WebSocketFactory.mjs'

Log.setLogLevel(EEasyDebugLogLevel.Verbose)
const ws = WebSocketFactory.getPresenterClient((messageEvent)=>{
  Log.d('TEST', 'Received message!', messageEvent)
})
ws.init()

</script>
<template>

</template>