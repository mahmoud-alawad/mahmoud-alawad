<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { CountUp } from 'countup.js'
import { usePageLoader } from '@/composables/usePageLoader'

const { setLoaded } = usePageLoader()

// CountUp scrive direttamente il numero dentro questo elemento: lasciamo
// che gestisca lui il conteggio fluido, Vue non tocca il contenuto.
const counterRef = ref<HTMLElement>()
const isVisible = ref(true)
const progress = ref(0)
const mm = gsap.matchMedia()

const emit = defineEmits<{
  complete: []
}>()

defineExpose({
  progress,
  isVisible,
})

onMounted(() => {
  const counter = new CountUp(counterRef.value!, 100, {
    startVal: 0,
    duration: 4,
    useGrouping: false,
    // Easing morbido in uscita, coerente col vecchio power2.out.
    useEasing: true,
    // Chiamata a ogni frame: ne approfitto per tenere sincronizzato
    // `progress` e ritorno la stringa intera da mostrare.
    formattingFn: (n: number) => {
      const rounded = Math.round(n)
      progress.value = rounded
      return String(rounded)
    },
  })

  counter.start(() => {
    progress.value = 100

    gsap.to('.page-loader', {
      opacity: 0,
      duration: 0.7,
      onStart: () => {
        setLoaded()
        emit('complete')
      },
      onComplete: () => {
        isVisible.value = false
      },
    })
  })

  mm.add('(min-width: 768px)', () => {
    gsap.fromTo(
      '.loader-text',
      {
        left: '2rem',
        bottom: '2rem',
        xPercent: 0,
        yPercent: 0,
      },
      {
        left: 'calc(100% - 2rem)',
        bottom: 'calc(100% - 2rem)',
        xPercent: -100,
        yPercent: 100,
        duration: 3.7,
        ease: 'power2.out',
      },
    )
  })

  mm.add('(max-width: 767px)', () => {
    // A mobile solo centratura + una comparsa morbida dell'intero blocco;
    // il conteggio resta gestito da CountUp.
    gsap.set('.loader-text', {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
    })

    gsap.from('.loader-text', {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
      duration: 1,
      ease: 'expo.out',
    })
  })
})

onUnmounted(() => {
  mm.revert()
})
</script>

<template>
  <Transition name="fade">
    <div v-show="isVisible" class="page-loader">
      <div class="loader-text">
        <!-- Il numero e' gestito da CountUp.js. -->
        <span ref="counterRef" class="digits">0</span>
        <span class="percent-sign">%</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 9999;
  overflow: hidden;
}

.loader-text {
  position: absolute;
  display: flex;
  align-items: baseline;
  color: var(--text);
  font-size: clamp(4rem, 8vw, 9rem);
  font-weight: 700;
  line-height: 1;
  user-select: none;
  will-change: transform;
  font-variant-numeric: tabular-nums;
}

.digits {
  display: inline-flex;
  align-items: baseline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
