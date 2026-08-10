<template>
  <component
    v-if="variant === 'primary'"
    :is="componentType"
    :to="isRouterLink ? to : undefined"
    :href="isAnchor ? href : undefined"
    :type="isButton ? buttonType : undefined"
    :class="classes"
    v-bind="$attrs"
  >
    <svg
      v-if="icon === 'plus' && iconPosition === 'left'"
      xmlns="http://www.w3.org/2000/svg"
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
    >
      <rect x="75" width="30" height="180" fill="#070707" />
      <rect
        x="180"
        y="75"
        width="30"
        height="180"
        transform="rotate(90 180 75)"
        fill="#070707"
      />
    </svg>

    <span>
      <slot />
    </span>

    <svg
      v-if="icon === 'plus' && iconPosition === 'right'"
      xmlns="http://www.w3.org/2000/svg"
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
    >
      <rect x="75" width="30" height="180" fill="#070707" />
      <rect
        x="180"
        y="75"
        width="30"
        height="180"
        transform="rotate(90 180 75)"
        fill="#070707"
      />
    </svg>
  </component>
  <component
    v-else
    :is="componentType"
    :to="isRouterLink ? to : undefined"
    :href="isAnchor ? href : undefined"
    :type="isButton ? buttonType : undefined"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { RouterLink } from 'vue-router'

type Icon = 'plus' | 'arrow' | 'none'
type IconPosition = 'left' | 'right'
type Variant = 'primary' | 'secondary' | 'normal'
type Outline = 'dark' | 'light' | null
type Tag = 'button' | 'a' | 'router-link'

const props = defineProps({
  tag: {
    type: String as PropType<Tag>,
    default: 'button',
  },

  variant: {
    type: String as PropType<Variant>,
    default: 'primary',
    validator: (v: Variant) => ['primary', 'secondary', 'normal'].includes(v),
  },

  icon: {
    type: String as PropType<Icon>,
    default: 'none',
    validator: (v: Icon) => ['plus', 'arrow', 'none'].includes(v),
  },

  iconPosition: {
    type: String as PropType<IconPosition>,
    default: 'right',
    validator: (v: IconPosition) => ['left', 'right'].includes(v),
  },

  outline: {
    type: String as PropType<Outline>,
    default: null,
    validator: (v: Outline) => !v || ['dark', 'light'].includes(v),
  },

  buttonType: {
    type: String,
    default: 'button',
  },

  href: {
    type: String,
    default: '',
  },

  to: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: null,
  },
})

const isButton = computed(() => props.tag === 'button')
const isAnchor = computed(() => props.tag === 'a')
const isRouterLink = computed(() => props.tag === 'router-link')

const componentType = computed(() => {
  return isRouterLink.value ? RouterLink : props.tag
})

const classes = computed(() => [
  'btn',
  props.variant !== 'normal' && `btn--${props.variant}`,
  props.outline && `btn--outline-${props.outline}`,
  props.variant === 'normal' && 'btn--normal',
  props.iconPosition && `--icon-${props.iconPosition}`,
])
</script>

<style lang="scss" scoped>
@use 'sass:color';

$primary: #000;
$secondary: #2d3748;

.btn {
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  cursor: pointer;
  text-decoration: none;
  color: var(--text);
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    transform 0.2s ease;

  &:hover {
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    overflow: hidden;
    border-radius: 0; // utile se vuoi un bordo unico continuo

    > span {
      display: inline-flex;
      align-items: center;
      padding-inline: 10px;
      padding-block: 4px;
      border: 1px solid var(--text);
      transition:
        background-color 0.35s ease,
        color 0.35s ease;
    }

    svg {
      width: 14px;
      height: 14px;
      border: 1px solid var(--text);
      padding: 6px;
      background-color: transparent;
      transform-origin: center;
      transition:
        transform 0.45s cubic-bezier(0.65, 0, 0.35, 1),
        background-color 0.35s ease,
        border-color 0.35s ease;

      rect {
        transition: fill 0.35s ease;
        fill: var(--text);
      }
    }

    &:hover {
      // gap: 0;
      &.--icon {
        &-left {
          svg {
            transform: rotate(-180deg) translateX(-0.28rem);
          }
        }
        &-right {
          svg {
            transform: rotate(180deg) translateX(0.28rem);
          }
        }
      }

      > span {
        background-color: var(--text);
        color: var(--bg, #fff);
      }

      svg {
        background-color: var(--text);

        rect {
          fill: var(--bg, #fff);
        }
      }
    }
  }

  &--secondary {
    background: $secondary;
    color: white;

    &:hover {
      background: color.scale($secondary, $lightness: 6.4885496183%);
    }
  }

  &--normal {
    padding: 0;
    background: transparent;
    border: none;
    font: inherit;
    color: inherit;
    gap: 0;
    transform: none;

    &:hover {
      transform: none;
      background: transparent;
    }
  }

  &--outline-dark {
    background: transparent;
    border-color: #111827;
    color: #111827;

    &:hover {
      background: #111827;
      color: white;
    }
  }

  &--outline-light {
    background: transparent;
    border-color: white;
    color: white;

    &:hover {
      background: white;
      color: #111827;
    }
  }
}
</style>
