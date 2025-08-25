<template>
  <div class="full-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'FullLayout',
}
</script>

<style scoped>
.full-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 