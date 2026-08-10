<template>
  <div class="not-found">
    <!-- decorazioni SVG quadrate -->
    <svg
      ref="blob1"
      class="not-found__shape not-found__shape--1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 480"
    >
      <path
        d="m0 360 120-120 120 120-120 120zM0 120 120 0l120 120-120 120zM240 120 360 0l120 120-120 120zM240 360l120-120 120 120-120 120z"
      ></path>
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 480"
      class="not-found__shape not-found__shape--2"
      ref="blob2"
    >
      <path d="m240 240 120 120-120 120-120-120zM240 0l120 120-120 120-120-120z"></path>
    </svg>

    <div class="not-found__content">
      <h1 ref="codeRef" class="not-found__code">404</h1>
      <h2 ref="titleRef" class="not-found__title">Page not found</h2>
      <p ref="textRef" class="not-found__text">
        The page you are looking for does not exist or has been moved.
      </p>

      <div ref="btnRef" class="not-found__btn-wrapper">
        <Btn to="/" tag="router-link" icon="plus" icon-position="left">
          Back to home
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import Btn from '@/components/Btn.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { usePageLoader } from '@/composables/usePageLoader'

const { onLoaderDone } = usePageLoader()

const codeRef = ref(null)
const titleRef = ref(null)
const textRef = ref(null)
const btnRef = ref(null)
const blob1 = ref(null)
const blob2 = ref(null)

let stop = () => {}

onMounted(() => {
  stop = onLoaderDone(() => {
    gsap.set([codeRef.value, titleRef.value, textRef.value, btnRef.value], {
      opacity: 0,
    })
    gsap.set(codeRef.value, { y: -60, scale: 0.6, rotate: -8 })
    gsap.set(titleRef.value, { y: 25 })
    gsap.set(textRef.value, { y: 20 })
    gsap.set(btnRef.value, { y: 20, scale: 0.92 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(codeRef.value, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      duration: 1,
      delay: 0.4,
      ease: 'back.out(1.7)',
    })
      .to(titleRef.value, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .to(textRef.value, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(btnRef.value, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, '-=0.35')

    gsap.to(codeRef.value, {
      y: -10,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: tl.duration(),
    })

    gsap.to(blob1.value, {
      rotate: 90,
      x: 30,
      y: -60,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    gsap.to(blob2.value, {
      rotate: -20,
      x: -40,
      y: 30,
      duration: 13,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  })
})

onUnmounted(() => stop())
</script>

<style lang="scss" scoped>
.not-found {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  overflow: hidden;

  &__shape {
    position: absolute;
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;

    path {
      fill: none;
      stroke: var(--accent);
      stroke-width: 1.5;
    }

    &--1 {
      width: 220px;
      height: 220px;
      top: 8%;
      left: 6%;
      transform: rotate(-145deg);

      path {
        stroke: var(--accent);
      }
    }

    &--2 {
      width: 280px;
      height: 280px;
      bottom: 6%;
      right: 8%;
      transform: rotate(-145deg);

      path {
        stroke: var(--accent);
      }
    }
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 500px;
  }

  &__code {
    font-size: 120px;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    // color: #6b6650;
  }

  &__title {
    font-size: 28px;
    margin: 10px 0;
  }

  &__text {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 30px;
  }

  &__btn-wrapper {
    display: inline-block;
  }
}
</style>
