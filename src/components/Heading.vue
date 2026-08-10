<template>
  <component :is="tag" :class="headingClasses">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span'

type HeadingVariant = 'primary' | 'secondary' | 'muted' | 'accent'

interface Props {
  tag?: HeadingTag
  variant?: HeadingVariant
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'h2',
  variant: 'primary',
})

const headingClasses = computed(() => {
  return ['app-heading', `app-heading--${props.variant}`]
})
</script>

<style lang="scss" scoped>
.app-heading {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;

  &--primary {
    color: #111;
    font-weight: 700;
  }

  &--secondary {
    color: #333;
    font-weight: 600;
  }

  &--muted {
    color: #777;
    font-weight: 500;
  }

  &--accent {
    color: #4f46e5;
    font-weight: 700;
  }
}
</style>
