<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'

// Lives in /public, so reference it via the configured base URL.
const worldMap = `${import.meta.env.BASE_URL}world_alpha_mini.jpg`

/**
 * Dotted-globe site background.
 * Land dots are sampled from a 360×180 world map (1px = 1°), so real continents
 * appear. Italy / Veneto is highlighted with a glowing marker, a pulsing ring
 * and a brighter, breathing dot cluster.
 */

const props = withDefaults(
  defineProps<{
    radius?: number
    dotColor?: string
    highlightColor?: string
    rotateSpeed?: number
  }>(),
  {
    radius: 20,
    dotColor: '#1e6b58',
    highlightColor: '#00e8a7',
    rotateSpeed: 0.3,
  },
)

const canvas = ref<HTMLCanvasElement | null>(null)

// Veneto (≈ Venice).
const VENETO_LAT = 45.44
const VENETO_LON = 12.34
const HIGHLIGHT_RADIUS_DEG = 6

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let group: THREE.Group
let dots: THREE.Points | null = null
let frame = 0
let ro: ResizeObserver | null = null

const tmpColor = new THREE.Color()

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

function angularDistanceDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = Math.PI / 180
  const a = lat1 * toRad
  const b = lat2 * toRad
  const d = (lon2 - lon1) * toRad
  const cos = Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(d)
  return Math.acos(THREE.MathUtils.clamp(cos, -1, 1)) / toRad
}

/** Read the world map and return a `isLand(lon, lat)` lookup. */
function sampleLandMap(img: HTMLImageElement) {
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, img.width, img.height).data
  const w = img.width
  const h = img.height

  // Land = dark pixels in this alpha map.
  const land = new Uint8Array(w * h)
  for (let p = 0, i = 0; i < data.length; i += 4, p++) {
    if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) land[p] = 1
  }

  return (lon: number, lat: number): boolean => {
    // lon: -180..180 -> x: 0..w-1 ; lat: 90..-90 -> y: 0..h-1
    const x = Math.round(((lon + 180) / 360) * (w - 1))
    const y = Math.round(((90 - lat) / 180) * (h - 1))
    if (x < 0 || x >= w || y < 0 || y >= h) return false
    return land[y * w + x] === 1
  }
}

function buildDots(isLand: (lon: number, lat: number) => boolean) {
  const { radius } = props
  const base = new THREE.Color(props.dotColor)
  const highlight = new THREE.Color(props.highlightColor)

  const pos: number[] = []
  const col: number[] = []
  const glowArr: number[] = []

  // Walk latitude bands; spacing along each band keeps a roughly even density.
  const dotDensity = 2.6
  for (let lat = 89; lat >= -89; lat -= 1) {
    const circ = Math.cos((Math.abs(lat) * Math.PI) / 180) * radius * Math.PI * 2
    const dotsForLat = Math.max(1, Math.floor(circ * dotDensity))
    for (let i = 0; i < dotsForLat; i++) {
      const lon = -180 + (i * 360) / dotsForLat
      if (!isLand(lon, lat)) continue

      const v = latLonToVec3(lat, lon, radius)
      pos.push(v.x, v.y, v.z)

      const dist = angularDistanceDeg(lat, lon, VENETO_LAT, VENETO_LON)
      const g = dist < HIGHLIGHT_RADIUS_DEG ? 1 - dist / HIGHLIGHT_RADIUS_DEG : 0
      glowArr.push(g)

      tmpColor.copy(base).lerp(highlight, g)
      col.push(tmpColor.r, tmpColor.g, tmpColor.b)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geo.setAttribute('aGlow', new THREE.Float32BufferAttribute(glowArr, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      u_time: { value: 0 },
      u_size: { value: 2.6 * renderer.getPixelRatio() },
      u_highlight: { value: new THREE.Color(props.highlightColor) },
    },
    vertexShader: /* glsl */ `
      attribute float aGlow;
      varying vec3 vColor;
      varying float vGlow;
      uniform float u_time;
      uniform float u_size;
      void main() {
        vColor = color;
        vGlow = aGlow;
        float pulse = 1.0 + aGlow * (0.7 + 0.7 * sin(u_time * 3.0));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = u_size * pulse * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vGlow;
      uniform vec3 u_highlight;
      uniform float u_time;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float edge = smoothstep(0.5, 0.12, d);
        vec3 color = vColor;
        color += u_highlight * vGlow * (0.4 + 0.4 * sin(u_time * 3.0)) * (1.0 - d);
        float alpha = edge * (0.75 + 0.25 * vGlow);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  })

  return new THREE.Points(geo, mat)
}

function makeGlowTexture(color: THREE.Color): THREE.Texture {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  const hex = `${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}`
  grad.addColorStop(0, `rgba(${hex}, 0.9)`)
  grad.addColorStop(0.3, `rgba(${hex}, 0.35)`)
  grad.addColorStop(1, `rgba(${hex}, 0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

/** Glowing pin + halo + pulsing ring on Veneto. */
function buildMarker() {
  const markerGroup = new THREE.Group()
  const surface = latLonToVec3(VENETO_LAT, VENETO_LON, props.radius)
  const normal = surface.clone().normalize()
  const highlight = new THREE.Color(props.highlightColor)

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: highlight }),
  )
  core.position.copy(surface).addScaledVector(normal, 0.4)
  markerGroup.add(core)

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(highlight),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  halo.scale.setScalar(6)
  halo.position.copy(core.position)
  markerGroup.add(halo)

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.05, 48),
    new THREE.MeshBasicMaterial({
      color: highlight,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  ring.position.copy(surface).addScaledVector(normal, 0.12)
  ring.lookAt(surface.clone().add(normal))
  markerGroup.add(ring)

  gsap.to(ring.scale, { x: 3, y: 3, duration: 2.2, repeat: -1, ease: 'power2.out' })
  gsap.to(ring.material as THREE.MeshBasicMaterial, {
    opacity: 0,
    duration: 2.2,
    repeat: -1,
    ease: 'power2.out',
  })

  return markerGroup
}

function init(isLand: (lon: number, lat: number) => boolean) {
  const el = canvas.value!
  const parent = el.parentElement!

  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(32, 1, 1, 1000)
  camera.position.set(0, 6, 62)
  camera.lookAt(0, 0, 0)

  // Drag to rotate (mouse + touch). Auto-rotates on its own; no zoom/pan.
  controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = true
  controls.autoRotateSpeed = props.rotateSpeed * 6
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.enableZoom = false
  controls.rotateSpeed = 0.5
  // Keep the globe from flipping past the poles.
  controls.minPolarAngle = Math.PI / 2 - 0.6
  controls.maxPolarAngle = Math.PI / 2 + 0.6

  group = new THREE.Group()
  group.rotation.z = THREE.MathUtils.degToRad(18)
  // Spin the globe so Europe faces the viewer at start.
  group.rotation.y = THREE.MathUtils.degToRad(-110)
  scene.add(group)

  // Faint inner sphere so back-facing dots read as "behind" a body.
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(props.radius * 0.99, 48, 48),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(props.dotColor).multiplyScalar(0.12),
      transparent: true,
      opacity: 0.65,
    }),
  )
  group.add(inner)

  dots = buildDots(isLand)
  group.add(dots)
  group.add(buildMarker())

  resize()
  ro = new ResizeObserver(resize)
  ro.observe(parent)

  animate()
}

function resize() {
  if (!camera) return
  const parent = canvas.value!.parentElement!
  const w = parent.offsetWidth
  const h = parent.offsetHeight
  camera.aspect = w / h

  if (w > 700) camera.position.z = 100
  else camera.position.z = 140

  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

function animate(t = 0) {
  frame = requestAnimationFrame(animate)

  controls.update()
  if (dots) (dots.material as THREE.ShaderMaterial).uniforms.u_time.value = t / 1000

  renderer.render(scene, camera)
}

onMounted(() => {
  const img = new Image()
  img.onload = () => init(sampleLandMap(img))
  img.src = worldMap
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  ro?.disconnect()
  controls?.dispose()
  gsap.globalTimeline.clear()
  scene?.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    mesh.geometry?.dispose?.()
    const m = mesh.material
    if (Array.isArray(m)) m.forEach((mm) => mm.dispose())
    else m?.dispose?.()
  })
  renderer?.dispose()
})
</script>

<template>
  <div class="globe-bg" aria-hidden="true">
    <canvas ref="canvas" class="globe-bg__canvas"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.globe-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  // background: radial-gradient(circle at 50% 45%, #0a1f1a 0%, #050b0a 70%, #030605 100%);

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
