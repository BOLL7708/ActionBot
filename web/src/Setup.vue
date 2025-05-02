<script lang="ts" setup>
import {ref} from 'vue'
import {SettingTwitchClient} from '../../lib/index.mjs'
import TwitchAuth from '../../lib/SharedConstants/TwitchAuth.mts'
import {IDatabaseMessage} from '../../lib/Types/WebSocket/Database.mjs'
import WebSocketFactory from './classes/WebSocketFactory.mjs'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'

const loaded = ref(false)
const factory = new WebSocketFactory()
const db = factory.getDatabaseClient((message: string) => {
  // TODO: We should get things like Twitch settings through this.
  console.log(message)
}, async (connected: boolean) => {
  loaded.value = connected

  if(connected) {
    // region Auth Result
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code') ?? ''
    const scope = decodeURIComponent(params.get('scope') ?? '')
    const returnState = params.get('state') ?? ''
    console.log({code, scope, returnState})
    db.send('test')
    // endregion

    const clientPayload: IDatabaseMessage = {key: 'Main', group: SettingTwitchClient.name}
    const clientResult = await db.sendMessageWithPromise(clientPayload, 'twitch-client')
    console.log({clientResult})

  }
})
db.init()



// TODO
//  We should check if we already have tokens, if so we are already authed!
//  Maybe we need a second one for the bot account?
const authed = ref(false)

// region Auth Params
const clientId = ref('1kbstdsxkfr8gi24fz93kpytttxlsq5')
const redirectUri = ref('http://localhost:5173/src/setup.html')
const scopes = ref(TwitchAuth.scopes.join(' '))
const state = ref('test')
// endregion



</script>
<template>
  <AppHeader/>
  <main>
    <div v-if="loaded && !authed">
      <form action="https://id.twitch.tv/oauth2/authorize" method="get">
        <input type="hidden" name="client_id" :value="clientId"/>
        <input type="hidden" name="redirect_uri" :value="redirectUri"/>
        <input type="hidden" name="response_type" value="code"/>
        <input type="hidden" name="scope" :value="scopes"/>
        <input type="hidden" name="state" :value="state"/>
        <button type="submit">Launch Twitch Authentication</button>
      </form>
    </div>
  </main>
  <AppFooter/>
</template>