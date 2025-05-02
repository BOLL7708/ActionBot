<script setup lang="ts">
import {ref} from 'vue'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import AppHeaderButton from './components/AppHeaderButton.vue'

const rootPath = ref(import.meta.env.DEV ? '/src' : '/dist')
</script>

<template>
  <AppHeader/>
  <main>
<!--    <img src="/actionbot_logo.svg" alt="ActionBot Logo" class="logo">-->
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
