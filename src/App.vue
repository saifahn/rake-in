<script setup lang="ts">
import { ref, computed } from 'vue'

const monthlyRent = ref(0)
const reikin = ref(0)
const lengthOfStayInMonths = ref(0)

const hasResult = computed(() => lengthOfStayInMonths.value > 0)

const normalizedRent = computed(() => {
  if (!hasResult.value) return 0
  return (
    (monthlyRent.value * lengthOfStayInMonths.value + reikin.value) / lengthOfStayInMonths.value
  )
})

const jpy = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

const formattedRent = computed(() => jpy.format(Math.round(normalizedRent.value)))
</script>

<template>
  <UApp>
    <main class="min-h-screen flex items-center justify-center p-4 bg-default">
      <UCard class="w-full max-w-md">
        <template #header>
          <h1 class="text-xl font-semibold text-highlighted">Rake-In</h1>
          <p class="text-sm text-muted mt-1">
            Normalize Japanese rent by spreading reikin over your stay.
          </p>
        </template>

        <div class="space-y-4">
          <UFormField label="Monthly Rent" name="monthlyRent">
            <UInputNumber
              v-model="monthlyRent"
              :min="0"
              :step="1000"
              class="w-full"
              :format-options="{ style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }"
            />
          </UFormField>

          <UFormField label="Reikin (礼金)" name="reikin">
            <UInputNumber
              v-model="reikin"
              :min="0"
              :step="10000"
              class="w-full"
              :format-options="{ style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }"
            />
          </UFormField>

          <UFormField label="Length of Stay" name="lengthOfStayInMonths" hint="months">
            <UInputNumber
              v-model="lengthOfStayInMonths"
              :min="0"
              :step="1"
              class="w-full"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex items-baseline justify-between">
            <span class="text-sm text-muted">Normalized monthly rent</span>
            <span class="text-2xl font-semibold tabular-nums text-highlighted">
              {{ hasResult ? formattedRent : '—' }}
            </span>
          </div>
        </template>
      </UCard>
    </main>
  </UApp>
</template>
