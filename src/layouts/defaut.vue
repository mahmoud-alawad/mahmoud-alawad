<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import PageLoader from '../components/PageLoader.vue'
import ScrollBarProgress from '../components/ScrollBarProgress.vue'
import { useLenis } from 'lenis/vue'
import { usePageLoader } from '@/composables/usePageLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Btn from '@/components/Btn.vue'
import { useRoute } from 'vue-router'

gsap.registerPlugin(ScrollTrigger)

const { onLoaderDone } = usePageLoader()
const route = useRoute()
const lerp = ref(0.1)
const lenisRef = ref()
const mainContent = ref<HTMLElement | null>(null)
const navWrapper = ref<HTMLElement | null>(null)

const menuOpen = ref(false)

const mm = gsap.matchMedia()

let menuTl: gsap.core.Timeline | null = null

const openMenu = () => {
  if (!navWrapper.value) return

  menuTl?.kill()
  menuOpen.value = true
  lenisRef.value?.lenis?.stop()

  const items = navWrapper.value.querySelectorAll('.nav > *')

  menuTl = gsap.timeline()

  menuTl
    .set(navWrapper.value, { display: 'flex' })
    .fromTo(
      navWrapper.value,
      { yPercent: -100 },
      {
        yPercent: 0,
        duration: 0.7,
        ease: 'power3.out',
      },
    )
    .fromTo(
      items,
      {
        yPercent: -120,
        opacity: 0,
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.4',
    )
}

const closeMenu = () => {
  if (!navWrapper.value) return

  menuTl?.kill()

  menuTl = gsap.timeline({
    onComplete: () => {
      gsap.set(navWrapper.value, { clearProps: 'display' })
      lenisRef.value?.lenis?.start()
    },
  })

  menuTl.to(navWrapper.value, {
    yPercent: -100,
    duration: 0.5,
    ease: 'power3.in',
  })

  menuOpen.value = false
}


watch(
  () => route.fullPath,
  () => {
    if (menuOpen.value) {
      closeMenu()
    }
  },
)

const toggleMenu = () => {
  menuOpen.value ? closeMenu() : openMenu()
}

const animateIntro = () => {
  const tl = gsap.timeline()

  gsap.set('.logo', {
    y: -40,
    opacity: 0,
    scale: 0.8,
  })

  gsap.set('.nav > *:not(.nav-border)', {
    y: -20,
    opacity: 0,
  })

  gsap.set('.nav-border', {
    scaleX: 0,
    opacity: 1,
    transformOrigin: 'left center',
  })

  gsap.set('.contact-btn', {
    y: -20,
    opacity: 0,
  })

  gsap.set('.menu-btn', {
    scale: 0.7,
    opacity: 0,
  })

  tl.to(mainContent.value, {
    yPercent: 0,
    rotateX: 0,
    opacity: 1,
    duration: 1.5,
    ease: 'power3.out',
    clearProps: 'transform,opacity',
  })

  tl.to(
    '.logo',
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all',
    },
    '-=1.1',
  )

  mm.add('(min-width:768px)', () => {
    tl.to(
      '.nav-border',
      {
        scaleX: 1,
        duration: 0.55,
        ease: 'power2.out',
        clearProps: 'transform',
        opacity: 1
      },
      '-=0.5',
    )
    tl.to(
      '.nav > *:not(.nav-border)',
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.45,
        ease: 'power3.out',
        clearProps: 'all',
      },
      '-=0.15',
    )

    tl.to(
      '.contact-btn',
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out',
        clearProps: 'all',
      },
      '<0.1',
    )
  })

  mm.add('(max-width:767px)', () => {
    tl.to(
      '.menu-btn',
      {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: 'back.out(1.8)',
        clearProps: 'all',
      },
      '-=0.35',
    )
  })
}

const onTick = (time: number) => {
  lenisRef.value?.lenis?.raf(time * 1000)
}

useLenis(() => {
  ScrollTrigger.update()
})

onMounted(() => {
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  onLoaderDone(() => {
    animateIntro()
  })
})

onUnmounted(() => {
  gsap.ticker.remove(onTick)
  menuTl?.kill()
  mm.revert()
})
</script>
<template>
  <vue-lenis ref="lenisRef" root :autoRaf="false" :options="{ lerp }">
    <PageLoader />
    <ScrollBarProgress />
    <div ref="mainContent" class="main-content">
      <header>
        <div class="container-xl">
          <Btn class="logo" variant="normal" tag="router-link" to="/">
            <svg width="80" height="80" viewBox="0 0 679 679" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_16457_6764)">
                <path
                  d="M339.391 339.39L177.387 333.406L167.816 171.575L329.82 177.559L339.391 339.39ZM510.965 507.206L348.962 501.222L339.391 339.39L501.394 345.375L510.965 507.206Z"
                  fill="#6B6650" />
                <path
                  d="M339.502 339.65L344.968 177.289L507.15 167.911L501.684 330.272L339.502 339.65ZM171.855 511.389L177.32 349.028L339.502 339.65L334.037 502.011L171.855 511.389Z"
                  fill="#6B6650" />
              </g>
              <defs>
                <clipPath id="clip0_16457_6764">
                  <rect width="480" height="480" fill="white" transform="translate(678.781 335.632) rotate(134.365)" />
                </clipPath>
              </defs>
            </svg>
          </Btn>
          <div ref="navWrapper" class="nav-wrapper">
            <nav class="nav">
              <span class="nav-border"></span>
              <Btn variant="normal" tag="router-link" to="/">01&nbsp;&nbsp;Home</Btn>
              <Btn variant="normal" tag="router-link" to="about">02&nbsp;&nbsp;About</Btn>
              <Btn variant="normal" tag="router-link" to="articles">03&nbsp;&nbsp;Articles</Btn>
            </nav>
          </div>
          <Btn class="contact-btn" variant="primary" href="mailto:awad25.ma@gmail.com" tag="a" icon="plus">Contact</Btn>
          <Btn class="menu-btn" variant="primary" tag="a" @click.prevent="toggleMenu">
            {{ menuOpen ? 'Close' : 'Menu' }}
          </Btn>
        </div>
      </header>
      <slot />
    </div>
  </vue-lenis>
</template>

<style lang="scss">
:deep(.lenis),
.main-content {
  perspective: 1200px;
}

.main-content {
  transform-style: preserve-3d;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  >div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .nav-wrapper {
    @media screen and (max-width: 479px) {
      padding-left: 6vw;
      padding-right: 6vw;
    }

    @media (max-width: 767px) {
      position: fixed;
      z-index: 1000;
      grid-column-gap: 0px;
      grid-row-gap: 0px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      height: 100svh;
      padding: 140px 60px;
      display: none;
      position: fixed;
      inset: 0% 0% auto;
      overflow: auto;
      background: var(--bg, #fff);
      will-change: transform;

      .nav {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        width: 100%;

        a,
        button {
          font-size: 2.4rem;
          margin-block-end: 1.2rem;
        }
      }
    }
  }

  .nav {
    @media (min-width: 768px) {
      position: relative;
      display: flex;
      gap: 1rem;
      padding: 10px 32px;

      .nav-border {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid currentColor;
        transform-origin: left center;
        pointer-events: none;
      }
    }
  }

  .logo {
    position: relative;
    z-index: 1001;

    path {
      fill: var(--text);
    }
  }

  .contact-btn {
    @media (max-width: 767px) {
      display: none !important;
    }
  }

  .menu-btn {
    position: relative;
    z-index: 1000;

    @media (min-width: 768px) {
      display: none !important;
    }
  }
}
</style>
