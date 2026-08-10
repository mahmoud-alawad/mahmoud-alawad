<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import { usePageLoader } from '@/composables/usePageLoader'
import gsap from 'gsap'
import { onMounted, onUnmounted, ref } from 'vue'

const { onLoaderDone } = usePageLoader()

const titleRef = ref(null)
const subtitleRef = ref(null)
const ctaRef = ref(null)

let stop = () => {}

onMounted(() => {
  stop = onLoaderDone(() => {
    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        duration: 1,
      },
    })

    tl.from(titleRef.value, {
      y: 40,
      opacity: 0,
    }).from(
      subtitleRef.value,
      {
        y: 30,
        opacity: 0,
      },
      '-=0.65',
    ).from(ctaRef.value, {
       y: 30,
        opacity: 0,
        scale: 0.4
    },'-=0.65',)
  })
})

onUnmounted(() => stop())
</script>

<template>
  <main class="home">
    <section class="intro h-screen">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1 class="intro__title" ref="titleRef">Mahmoud Alawad</h1>
          </div>
          <div class="col-10 mx-auto">
            <div class="intro__subtitle" ref="subtitleRef">
              I'm a fullstack developer. I specialize in WordPress and Laravel, but I'm
              always excited to expand my skill set.
            </div>
            <div class="intro__cta" ref="ctaRef">
              <Btn  tag="router-link" to="about">About me</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.home {
  .intro {
    display: flex;
    justify-content: center;
    align-items: center;
    &__title {
      text-align: center;
    }
    &__subtitle {
      font-size: 2rem;
      text-align: center;
      margin-block-end: 16px;
      @media (max-width:991px) {
        font-size: 1.5rem;
      }
    }
    &__cta {
     text-align: center;
    }
  }
}
</style>
