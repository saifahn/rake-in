<script setup lang="ts">
import { computed } from 'vue'
import { effectiveMonthly, type Mode, type Property } from '../cost'

const props = defineProps<{
  properties: Property[]
  mode: Mode
}>()

const MAX_MONTHS = 48
const WIDTH = 640
const HEIGHT = 280
const PADDING = { top: 16, right: 16, bottom: 28, left: 64 }

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#a855f7', '#ef4444', '#eab308']

const series = computed(() =>
  props.properties.map((property, i) => {
    const points = []
    for (let m = 1; m <= MAX_MONTHS; m++) {
      points.push({ months: m, value: effectiveMonthly(property, m, props.mode) })
    }
    return { property, color: COLORS[i % COLORS.length]!, points }
  }),
)

const maxValue = computed(() => {
  let max = 0
  for (const s of series.value) {
    for (const p of s.points) {
      if (p.value > max) max = p.value
    }
  }
  return max === 0 ? 1 : max
})

const innerWidth = WIDTH - PADDING.left - PADDING.right
const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

function x(months: number) {
  return PADDING.left + (months / MAX_MONTHS) * innerWidth
}
function y(value: number) {
  return PADDING.top + innerHeight - (value / maxValue.value) * innerHeight
}

const linePaths = computed(() =>
  series.value.map((s) => ({
    color: s.color,
    d: s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.months).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' '),
  })),
)

const yTicks = computed(() => {
  const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => {
    const value = (maxValue.value / steps) * i
    return { value, label: jpy.format(Math.round(value)), y: y(value) }
  })
})

const xTicks = [12, 24, 36, 48].map((m) => ({ months: m, x: x(m) }))
</script>

<template>
  <UCard v-if="properties.length > 0">
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">Effective monthly cost over time</h2>
      <p class="text-sm text-muted mt-1">Where the lines cross is where the ranking changes.</p>
    </template>

    <div class="overflow-x-auto">
      <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="w-full" style="min-width: 480px">
        <!-- gridlines + y labels -->
        <g v-for="tick in yTicks" :key="tick.value">
          <line
            :x1="PADDING.left"
            :x2="WIDTH - PADDING.right"
            :y1="tick.y"
            :y2="tick.y"
            stroke="currentColor"
            class="text-default"
            stroke-width="1"
            opacity="0.15"
          />
          <text :x="PADDING.left - 8" :y="tick.y + 4" text-anchor="end" font-size="10" fill="currentColor" class="text-muted">
            {{ tick.label }}
          </text>
        </g>

        <!-- x axis ticks -->
        <g v-for="tick in xTicks" :key="tick.months">
          <line
            :x1="tick.x"
            :x2="tick.x"
            :y1="PADDING.top"
            :y2="HEIGHT - PADDING.bottom"
            stroke="currentColor"
            class="text-default"
            stroke-width="1"
            opacity="0.1"
          />
          <text :x="tick.x" :y="HEIGHT - PADDING.bottom + 16" text-anchor="middle" font-size="10" fill="currentColor" class="text-muted">
            {{ tick.months }}mo
          </text>
        </g>

        <!-- lines -->
        <path v-for="(line, i) in linePaths" :key="i" :d="line.d" fill="none" :stroke="line.color" stroke-width="2" />
      </svg>

      <div class="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        <div v-for="s in series" :key="s.property.id" class="flex items-center gap-1.5 text-sm">
          <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: s.color }" />
          <span class="text-toned">{{ s.property.name || 'Untitled' }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>