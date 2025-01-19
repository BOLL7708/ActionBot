<script setup lang="ts">
import {ref} from 'vue'

const rootPath = ref(import.meta.env.DEV ? '/src' : '/dist')
</script>

<template>
  <div class="container">
    <img src="/actionbot_logo.svg" alt="ActionBot Logo" class="logo">
    <p><a :href="rootPath+'/editor.html'">Editor</a></p>
    <p><a :href="rootPath+'/presenter.html'">Presenter</a></p>
    <p><a :href="rootPath+'/dashboard.html'">Dashboard</a></p>
  </div>
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
