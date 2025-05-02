<script lang="ts" setup>
const props = defineProps(['url', 'target'])
</script>
<template>
  <div>
    <a :href="url" :target="target"><slot/></a>
  </div>
</template>