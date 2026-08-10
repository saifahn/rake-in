import type { Mode, Property } from './cost'

const STORAGE_KEY = 'rake-in:state'

interface PersistedState {
  properties: Property[]
  mode: Mode
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.properties) || typeof parsed.mode !== 'string') return null
    return parsed as PersistedState
  } catch {
    return null
  }
}

export function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — silently skip persistence.
  }
}
