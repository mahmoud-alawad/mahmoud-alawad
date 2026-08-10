<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const bar = ref<HTMLElement | null>(null)
let scrollTrigger: ScrollTrigger | null = null

onMounted(() => {
  scrollTrigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      bar.value?.style.setProperty('--progress', `${self.progress * 100}%`)
    },
  })
})

onUnmounted(() => {
  scrollTrigger?.kill()
})
</script>

<template>
  <div ref="bar" class="scroll-progress"></div>
</template>

<style scoped lang="scss">
.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 0.2rem;
  height: 100vh;
  background: #08060d;
  z-index: 9999;
  transition: transform 0.1s cubic-bezier(0, 0.55, 0.5, 1);
}

.scroll-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--progress, 0%);
  background: var(--accent);
  transition: height 0.1s cubic-bezier(0, 0.55, 0.5, 1);

  border-radius: 10px;
}
</style>
