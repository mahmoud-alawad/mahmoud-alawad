<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { usePageLoader } from '@/composables/usePageLoader'

gsap.registerPlugin(SplitText)

const { onLoaderDone } = usePageLoader()

const containerRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)

let stop = () => { }
let ctx: gsap.Context
let titleSplit: SplitText
let textSplit: SplitText

onMounted(() => {
  stop = onLoaderDone(() => {
    ctx = gsap.context(() => {
      titleSplit = new SplitText(titleRef.value!, {
        type: 'lines',
        mask: 'lines',
      })

      textSplit = new SplitText(descriptionRef.value!, {
        type: 'lines',
        mask: 'lines',
      })

      gsap.set(titleSplit.lines, {
        yPercent: 120,
        opacity: 0,
      })

      gsap.set(textSplit.lines, {
        yPercent: 100,
        opacity: 0,
      })

      const tl = gsap.timeline({
        defaults: {
          ease: 'power4.out',
        },
      })

      tl.to(titleSplit.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.08,
      }).to(
        textSplit.lines,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
        },
        '-=0.5',
      )
    }, containerRef)
  })
})

onUnmounted(() => {
  titleSplit?.revert()
  textSplit?.revert()
  ctx?.revert()
  stop()
})
</script>

<template>
  <main class="about h-screen">
    <div class="container" ref="containerRef">
      <h1 class="title" ref="titleRef">
        I am a Full Stack Web Developer with over 6 years of professional experience building high performance websites
        and web applications.
      </h1>
      <div class="description" ref="descriptionRef">
        I specialize in developing websites using Laravel based CMS solutions and WordPress with fully custom themes
        designed to meet business needs. My focus is on creating fast, secure, and maintainable websites that are
        optimized for SEO, accessibility (WCAG), and performance.

        My primary expertise is in PHP development and Nodejs, with extensive experience in Laravel, WordPress, Node.js,
        and Payload CMS. On the frontend, I build modern Single Page Applications using mainly Vue.js and React, with a
        solid
        understanding of Angular fundamentals.

        Beyond web development, I have advanced knowledge of Bash scripting, Unix/Linux systems administration,
        networking, Docker, and CI/CD pipelines, allowing me to manage the complete development and deployment workflow
        efficiently.

        I enjoy delivering high quality digital experiences that are scalable, accessible, and easy to maintain.
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.about {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .title {
    font-size: clamp(1.4rem, 4vw, 1.8rem);
    line-height: 1.25;
    text-align: center;
    margin-block-end: 8px;
    overflow-wrap: break-word;
  }

  .description {
    font-size: clamp(1rem, 3.2vw, 1.5rem);
    line-height: 1.5;
    text-align: center;
    overflow-wrap: break-word;
  }
}
</style>
