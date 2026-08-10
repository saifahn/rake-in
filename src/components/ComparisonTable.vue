<script setup lang="ts">
import { computed } from 'vue'
import { effectiveMonthly, totalCost, type Mode, type Property } from '../cost'

const props = defineProps<{
  properties: Property[]
  mode: Mode
}>()

const HORIZONS = [
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
  { label: '3 years', months: 36 },
]

const jpy = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

const rows = computed(() =>
  props.properties.map((property) => ({
    property,
    cells: HORIZONS.map((h) => ({
      monthly: effectiveMonthly(property, h.months, props.mode),
      total: totalCost(property, h.months, props.mode),
    })),
  })),
)

const cheapestPerColumn = computed(() =>
  HORIZONS.map((_, colIndex) => {
    if (rows.value.length === 0) return null
    let best = rows.value[0]!.cells[colIndex]!.monthly
    for (const row of rows.value) {
      const v = row.cells[colIndex]!.monthly
      if (v < best) best = v
    }
    return best
  }),
)
</script>

<template>
  <UCard v-if="properties.length > 0">
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">Comparison</h2>
      <p class="text-sm text-muted mt-1">Effective monthly cost — rent plus amortized fees.</p>
    </template>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-default">
            <th class="text-left py-2 pr-4 font-medium text-muted">Property</th>
            <th v-for="h in HORIZONS" :key="h.months" class="text-right py-2 px-4 font-medium text-muted">
              {{ h.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.property.id" class="border-b border-default last:border-0">
            <td class="py-3 pr-4 font-medium text-highlighted">
              {{ row.property.name || 'Untitled' }}
            </td>
            <td
              v-for="(cell, i) in row.cells"
              :key="i"
              class="text-right py-3 px-4 tabular-nums"
              :class="cell.monthly === cheapestPerColumn[i] ? 'text-success font-semibold' : 'text-toned'"
            >
              <div>{{ jpy.format(Math.round(cell.monthly)) }}<span class="text-muted font-normal">/mo</span></div>
              <div class="text-xs text-dimmed font-normal">{{ jpy.format(Math.round(cell.total)) }} total</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>