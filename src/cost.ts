// Pure cost model for comparing Japanese rental properties.
// No Vue imports on purpose — this is the part worth getting right in isolation.

export type Money = number // JPY, integer
export type Mode = 'step' | 'prorate'

export interface LabeledAmount {
  label: string
  amount: Money
}

export interface Recurring {
  label: string
  amount: Money
  everyYears: number
  /** Paid at signing (e.g. 火災保険) vs. only paid to continue past a contract boundary (e.g. 更新料). */
  firstPaymentAtMoveIn: boolean
}

export interface Property {
  id: string
  name: string

  // monthly
  rent: Money
  managementFee: Money // 管理費 / 共益費
  otherMonthly: LabeledAmount

  // one-time, at move-in
  keyMoney: Money // 礼金
  agencyFeePercent: number // 仲介手数料, as a percentage of monthly rent (e.g. 100 = one month's rent)
  otherUpfront: LabeledAmount

  // recurring, on a multi-year cycle
  renewal: Recurring // 更新料
  insurance: Recurring // 火災保険
  otherRecurring: Recurring
}

export function makeLabeledAmount(label = '', amount: Money = 0): LabeledAmount {
  return { label, amount }
}

export function makeRecurring(
  label = '',
  amount: Money = 0,
  everyYears = 2,
  firstPaymentAtMoveIn = false,
): Recurring {
  return { label, amount, everyYears, firstPaymentAtMoveIn }
}

let nextId = 1

export function makeProperty(name = ''): Property {
  return {
    id: `${Date.now()}-${nextId++}`,
    name,
    rent: 0,
    managementFee: 0,
    otherMonthly: makeLabeledAmount(),
    keyMoney: 0,
    agencyFeePercent: 100,
    otherUpfront: makeLabeledAmount(),
    renewal: makeRecurring('更新料', 0, 2, false),
    insurance: makeRecurring('火災保険', 0, 2, true),
    otherRecurring: makeRecurring(),
  }
}

/** How many times a recurring fee has been paid by `months` months of tenancy. */
export function paymentCount(months: number, everyYears: number, firstPaymentAtMoveIn: boolean): number {
  const periodMonths = everyYears * 12
  if (periodMonths <= 0) return firstPaymentAtMoveIn ? 1 : 0

  let count = firstPaymentAtMoveIn ? 1 : 0
  // Renewal-style fees are paid to continue *past* a boundary: staying exactly
  // to the boundary (e.g. 24 months on a 2-year contract) means it's never paid.
  for (let k = 1; k * periodMonths < months; k++) {
    count++
  }
  return count
}

function recurringCost(r: Recurring, months: number, mode: Mode): Money {
  if (mode === 'prorate') {
    const periodMonths = r.everyYears * 12
    if (periodMonths <= 0) return 0
    return (r.amount / periodMonths) * months
  }
  return r.amount * paymentCount(months, r.everyYears, r.firstPaymentAtMoveIn)
}

export function agencyFee(p: Property): Money {
  return (p.rent * p.agencyFeePercent) / 100
}

export function totalCost(p: Property, months: number, mode: Mode): Money {
  const monthly = (p.rent + p.managementFee + p.otherMonthly.amount) * months
  const upfront = p.keyMoney + agencyFee(p) + p.otherUpfront.amount
  const recurring =
    recurringCost(p.renewal, months, mode) +
    recurringCost(p.insurance, months, mode) +
    recurringCost(p.otherRecurring, months, mode)
  return monthly + upfront + recurring
}

export function effectiveMonthly(p: Property, months: number, mode: Mode): Money {
  if (months <= 0) return 0
  return totalCost(p, months, mode) / months
}
