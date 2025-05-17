<script setup lang="ts">
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mjs'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'

// const rootPath = ref(import.meta.env.DEV ? '/src' : '/dist')
// DatabaseHelper.get(new ConfigServer(), 'Main')
// const salt = ValueUtils.generateSalt()
// const hash = await ValueUtils.hashPassword('test', new Uint8Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10))
// console.log({salt, hash})
</script>

<template>
  <AppHeader/>
  <main>
    Hello, this text is in App.vue, go there to edit it!
  </main>
  <AppFooter/>
</template>

<style scoped>
.container {
  display: flex;
  align-content: center;
  flex-direction: column;
}

.logo {
  width: 150pt;
}
</style>
