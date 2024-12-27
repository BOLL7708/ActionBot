<script setup lang="ts">
import {ref} from "vue";

const rootPath = ref(import.meta.env.DEV ? '/src/pages' : '/dist')
</script>

<template>
  <div>
    <ul>
      <li><a :href="rootPath+'/editor.html'">Editor</a></li>
      <li><a :href="rootPath+'/presenter.html'">Presenter</a></li>
      <li><a :href="rootPath+'/dashboard.html'">Dashboard</a></li>
    </ul>
  </div>
</template>

<style scoped>
</style>
