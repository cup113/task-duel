<template>
  <div :class="['rounded-lg border bg-card text-card-foreground shadow-sm', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

defineProps<Props>()
</script>
