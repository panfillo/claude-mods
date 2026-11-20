import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionContextUsage, SessionRateLimit } from 'claude-code'

import type { Meter } from '../types'

const meters = atom({ plugin: 'usage-meter', key: 'meters' } as const, [] as Meter[])

const LABELS: Record<string, string> = {
  five_hour: '5 ore',
  seven_day: '7 giorni',
  spend_limit: 'Spesa',
}

function toMeters(limits: SessionRateLimit[], context: SessionContextUsage): Meter[] {
  const out: Meter[] = limits.map(l => ({
    label: LABELS[l.kind] ?? l.kind,
    percent: l.percentUsed,
    resetsAt: l.resetsAt,
  }))
  if (context.percent !== undefined) {
    out.push({ label: 'Contesto', percent: Math.round(context.percent) })
  }
  return out
}

function resetText(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return ` (reset ${d.getDate()}/${d.getMonth() + 1} ${hh}:${mm})`
}

function color(p: number): string {
  return p >= 90 ? 'red' : p >= 70 ? 'yellow' : 'green'
}

async function refresh($: EngineInterface, list: Meter[]) {
  await update($, meters, () => list)
  $.ui.status(
    list.length ? 'Uso: ' + list.map(m => `${m.label} ${m.percent}%`).join(' · ') : undefined,
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    await refresh($, toMeters(u.rateLimits, u.context))
    return r
  })

  on('session.measure', async ($, e, next) => {
    await refresh($, toMeters(e.rateLimits, e.context))
    if (e.changed.includes('rateLimits')) {
      const hot = e.rateLimits.find(l => l.percentUsed >= 90)
      if (hot) $.ui.toast(`Attenzione: limite ${LABELS[hot.kind] ?? hot.kind} al ${hot.percentUsed}%`)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, meters)
    if (e.props.hasSurvey || list.length === 0) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const W = 10

    return (
      <Box flexDirection="row" flexWrap="wrap">
        {list.map(m => {
          const filled = Math.max(0, Math.min(W, Math.round((m.percent / 100) * W)))
          return (
            <Box key={m.label} flexDirection="row" marginRight={2}>
              <Text>{m.label} </Text>
              <Text color={color(m.percent)}>{'█'.repeat(filled)}</Text>
              <Text dimColor>{'░'.repeat(W - filled)}</Text>
              <Text color={color(m.percent)} bold> {m.percent}%</Text>
              <Text dimColor>{resetText(m.resetsAt)}</Text>
            </Box>
          )
        })}
      </Box>
    )
  })
}
