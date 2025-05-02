<script lang="ts" setup>
import {ref} from 'vue'
import AppHeaderButton from './AppHeaderButton.vue'

const rootPath = ref(import.meta.env.DEV ? '/src' : '/dist')
</script>
<template>
  <header>
    <img src="/actionbot_icon.svg" alt="ActionBot Logo" class="logo">
    <div class="menu">
      <AppHeaderButton :url="rootPath+'/setup.html'">🔨 Setup</AppHeaderButton>
      <AppHeaderButton :url="rootPath+'/editor.html'">💎 Editor</AppHeaderButton>
      <AppHeaderButton :url="rootPath+'/presenter.html'">🎭 Presenter</AppHeaderButton>
      <AppHeaderButton :url="rootPath+'/dashboard.html'">😛 Dashboard</AppHeaderButton>
    </div>
  </header>
</template>