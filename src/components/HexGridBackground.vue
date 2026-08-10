<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

/**
 * Simple transparent grid background.
 * A full-screen shader draws thin grid lines over a transparent canvas — only
 * the lines are visible, so the page background shows through.
 */

const props = withDefaults(
  defineProps<{
    /** Grid line colour. */
    lineColor?: string
    /** Line opacity (0–1). */
    opacity?: number
    /** Cell size in CSS pixels. */
    cellSize?: number
    /** Line thickness in CSS pixels. */
    lineWidth?: number
  }>(),
  {
    lineColor: '#00e8a7',
    opacity: 0.12,
    cellSize: 48,
    lineWidth: 1,
  },
)

const canvas = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let mesh: THREE.Mesh
let material: THREE.ShaderMaterial
let frame = 0
let ro: ResizeObserver | null = null

function init() {
  const el = canvas.value!
  const parent = el.parentElement!

  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_pixelRatio: { value: renderer.getPixelRatio() },
      u_cell: { value: props.cellSize },
      u_lineWidth: { value: props.lineWidth },
      u_color: { value: new THREE.Color(props.lineColor) },
      u_opacity: { value: props.opacity },
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_pixelRatio;
      uniform float u_cell;
      uniform float u_lineWidth;
      uniform vec3  u_color;
      uniform float u_opacity;

      void main() {
        // Work in CSS pixels so cell size stays constant on hi-dpi screens.
        vec2 px = gl_FragCoord.xy / u_pixelRatio;

        vec2 g = mod(px, u_cell);
        // Distance to the nearest grid line on each axis.
        vec2 d = min(g, u_cell - g);
        float line = min(d.x, d.y);

        // Anti-aliased line of the requested width.
        float half = u_lineWidth * 0.5;
        float alpha = (1.0 - smoothstep(half - 0.5, half + 0.5, line)) * u_opacity;

        if (alpha <= 0.0) discard;
        gl_FragColor = vec4(u_color, alpha);
      }
    `,
  })

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  resize()
  ro = new ResizeObserver(resize)
  ro.observe(parent)

  animate()
}

function resize() {
  const parent = canvas.value!.parentElement!
  const w = parent.offsetWidth
  const h = parent.offsetHeight
  renderer.setSize(w, h, false)
  material.uniforms.u_resolution.value.set(w, h)
  material.uniforms.u_pixelRatio.value = renderer.getPixelRatio()
}

function animate() {
  frame = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

onMounted(init)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  ro?.disconnect()
  mesh?.geometry.dispose()
  material?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <div class="grid-bg" aria-hidden="true">
    <canvas ref="canvas" class="grid-bg__canvas"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.grid-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
