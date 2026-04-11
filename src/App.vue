<script setup lang="ts">
import { ref, computed } from 'vue'

const monthlyRent = ref(0)
const reikin = ref(0)
const lengthOfStayInMonths = ref(0)

const normalizedRent = computed(() => {
  if (lengthOfStayInMonths.value === 0) return 0
  return (
    (monthlyRent.value * lengthOfStayInMonths.value + reikin.value) / lengthOfStayInMonths.value
  )
})
</script>

<template>
  <label>
    <span>Monthly Rent:</span>
    <input v-model.number="monthlyRent" type="number" />
  </label>
  <label>
    <span>Reikin:</span>
    <input v-model.number="reikin" type="number" />
  </label>
  <label>
    <span>Length of Stay (months):</span>
    <input v-model.number="lengthOfStayInMonths" type="number" />
  </label>

  <p>Normalized Rent: {{ normalizedRent }}</p>
</template>

<style scoped></style>
