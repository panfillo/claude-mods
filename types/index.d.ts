export type Meter = { label: string; percent: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'usage-meter': { meters: Meter[] }
  }
}
