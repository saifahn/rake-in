<script setup lang="ts">
import { ref, watch } from 'vue'
import { makeProperty, type Mode, type Property } from './cost'
import { loadState, saveState } from './storage'
import PropertyCard from './components/PropertyCard.vue'
import ComparisonTable from './components/ComparisonTable.vue'
import CrossoverChart from './components/CrossoverChart.vue'

const persisted = loadState()

const properties = ref<Property[]>(
  persisted?.properties.length
    ? persisted.properties
    : [makeProperty('Property A'), makeProperty('Property B'), makeProperty('Property C')],
)
const mode = ref<Mode>(persisted?.mode ?? 'prorate')

watch(
  [properties, mode],
  () => {
    saveState({ properties: properties.value, mode: mode.value })
  },
  { deep: true },
)

function addProperty() {
  properties.value.push(makeProperty(`Property ${String.fromCharCode(65 + properties.value.length)}`))
}

function removeProperty(id: string) {
  properties.value = properties.value.filter((p) => p.id !== id)
}

function duplicateProperty(id: string) {
  const source = properties.value.find((p) => p.id === id)
  if (!source) return
  const copy: Property = structuredClone(source)
  copy.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  copy.name = `${source.name} (copy)`
  const index = properties.value.indexOf(source)
  properties.value.splice(index + 1, 0, copy)
}

const modeItems = [
  { label: 'Prorate (smooth)', value: 'prorate' },
  { label: 'Step (as paid)', value: 'step' },
]
</script>

<template>
  <UApp>
    <main class="min-h-screen p-4 md:p-8 bg-default">
      <div class="max-w-5xl mx-auto space-y-6">
        <header class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-highlighted">Rake-In</h1>
            <p class="text-sm text-muted mt-1">
              Compare the real cost of rental properties — rent, key money, and recurring fees, normalized over time.
            </p>
          </div>
          <UFormField label="Fee treatment" class="w-56">
            <USelect v-model="mode" :items="modeItems" value-key="value" class="w-full" />
          </UFormField>
        </header>

        <ComparisonTable :properties="properties" :mode="mode" />
        <CrossoverChart :properties="properties" :mode="mode" />

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <PropertyCard
            v-for="(property, index) in properties"
            :key="property.id"
            v-model="properties[index]!"
            :removable="properties.length > 1"
            @remove="removeProperty(property.id)"
            @duplicate="duplicateProperty(property.id)"
          />
        </div>

        <UButton icon="i-lucide-plus" color="neutral" variant="outline" @click="addProperty">
          Add property
        </UButton>
      </div>
    </main>
  </UApp>
</template>
