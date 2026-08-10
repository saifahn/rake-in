<script setup lang="ts">
import { computed } from 'vue'
import { agencyFee, type Property } from '../cost'

const property = defineModel<Property>({ required: true })

const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const agencyFeeAmount = computed(() => jpy.format(Math.round(agencyFee(property.value))))

defineProps<{
  removable: boolean
}>()

const emit = defineEmits<{
  remove: []
  duplicate: []
}>()

const jpyOptions = { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 } as const
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UInput v-model="property.name" placeholder="Property name" class="flex-1" size="lg" />
        <UButton
          icon="i-lucide-copy"
          color="neutral"
          variant="ghost"
          size="sm"
          title="Duplicate"
          @click="emit('duplicate')"
        />
        <UButton
          v-if="removable"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          title="Remove"
          @click="emit('remove')"
        />
      </div>
    </template>

    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-medium text-highlighted">Monthly</h3>
        <UFormField label="Rent (家賃)">
          <UInputNumber v-model="property.rent" :min="0" :step="1000" class="w-full" :format-options="jpyOptions" />
        </UFormField>
        <UFormField label="Management fee (管理費)">
          <UInputNumber
            v-model="property.managementFee"
            :min="0"
            :step="500"
            class="w-full"
            :format-options="jpyOptions"
          />
        </UFormField>
        <UFormField label="Other monthly">
          <UFieldGroup class="w-full">
            <UInput v-model="property.otherMonthly.label" placeholder="Label" class="flex-1" />
            <UInputNumber
              v-model="property.otherMonthly.amount"
              :step="500"
              class="w-40"
              :format-options="jpyOptions"
            />
          </UFieldGroup>
        </UFormField>
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-medium text-highlighted">One-time (at move-in)</h3>
        <UFormField label="Key money (礼金)">
          <UInputNumber
            v-model="property.keyMoney"
            :min="0"
            :step="10000"
            class="w-full"
            :format-options="jpyOptions"
          />
        </UFormField>
        <UFormField label="Agency fee (仲介手数料)" :hint="`= ${agencyFeeAmount}`">
          <UFieldGroup class="w-full">
            <UInputNumber v-model="property.agencyFeePercent" :min="0" :step="10" class="flex-1" />
            <span class="flex items-center px-3 text-sm text-muted border border-default rounded-md">
              % of rent
            </span>
          </UFieldGroup>
        </UFormField>
        <UFormField label="Other one-time">
          <UFieldGroup class="w-full">
            <UInput v-model="property.otherUpfront.label" placeholder="Label" class="flex-1" />
            <UInputNumber
              v-model="property.otherUpfront.amount"
              :step="10000"
              class="w-40"
              :format-options="jpyOptions"
            />
          </UFieldGroup>
        </UFormField>
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-medium text-highlighted">Recurring</h3>

        <div class="space-y-2 rounded-lg border border-default p-3">
          <p class="text-xs font-medium text-muted">Renewal fee (更新料)</p>
          <UFieldGroup class="w-full">
            <UInputNumber v-model="property.renewal.amount" :step="10000" class="flex-1" :format-options="jpyOptions" />
            <UInputNumber v-model="property.renewal.everyYears" :min="1" :step="1" class="w-28" />
          </UFieldGroup>
          <p class="text-xs text-muted">amount, every N years</p>
          <UCheckbox v-model="property.renewal.firstPaymentAtMoveIn" label="Also paid at move-in" />
        </div>

        <div class="space-y-2 rounded-lg border border-default p-3">
          <p class="text-xs font-medium text-muted">Insurance (火災保険)</p>
          <UFieldGroup class="w-full">
            <UInputNumber
              v-model="property.insurance.amount"
              :step="1000"
              class="flex-1"
              :format-options="jpyOptions"
            />
            <UInputNumber v-model="property.insurance.everyYears" :min="1" :step="1" class="w-28" />
          </UFieldGroup>
          <p class="text-xs text-muted">amount, every N years</p>
          <UCheckbox v-model="property.insurance.firstPaymentAtMoveIn" label="Also paid at move-in" />
        </div>

        <div class="space-y-2 rounded-lg border border-default p-3">
          <p class="text-xs font-medium text-muted">Other recurring</p>
          <UInput v-model="property.otherRecurring.label" placeholder="Label (e.g. 保証会社)" class="w-full" />
          <UFieldGroup class="w-full">
            <UInputNumber
              v-model="property.otherRecurring.amount"
              :step="1000"
              class="flex-1"
              :format-options="jpyOptions"
            />
            <UInputNumber v-model="property.otherRecurring.everyYears" :min="1" :step="1" class="w-28" />
          </UFieldGroup>
          <p class="text-xs text-muted">amount, every N years</p>
          <UCheckbox v-model="property.otherRecurring.firstPaymentAtMoveIn" label="Also paid at move-in" />
        </div>
      </section>
    </div>
  </UCard>
</template>
