// outlay (host half): the agent's hands on the books, and the dashboard's own API.
// Tools the model calls (outlay_add, outlay_list, outlay_remove) plus three read/write
// routes the dashboard uses. Data is one append-only file: <app home>/data/outlay.jsonl
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'outlay'
export const inject = ['tools', 'webServer']

export const CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'health', 'fun', 'other']

const MAX_BODY = 64 * 1024
const MAX_NOTE = 200

/** Where the books live: the app's own folder, never the plugin's code folder. */
function dataFile(ctx) {
  const home = ctx.get('appInstance')?.home ?? process.env.ACRYL_HOME ?? process.cwd()
  return join(home, 'data', 'outlay.jsonl')
}

function currencyOf(config) {
  const value = config?.currency
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : '$'
}

function readEntries(ctx) {
  const file = dataFile(ctx)
  if (!existsSync(file)) return []
  const entries = []
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const text = line.trim()
    if (text === '') continue
    try {
      const entry = JSON.parse(text)
      if (typeof entry?.amount === 'number' && entry.amount > 0) {
        if (typeof entry.id !== 'string') entry.id = randomUUID()
        entries.push(entry)
      }
    } catch {
      // A half-written line is skipped, never fatal.
    }
  }
  return entries
}

function writeEntries(ctx, entries) {
  const file = dataFile(ctx)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, entries.map(entry => JSON.stringify(entry)).join('\n') + (entries.length === 0 ? '' : '\n'))
}

function addEntry(ctx, input) {
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('amount must be a positive number')
  const note = String(input.note ?? '').trim().slice(0, MAX_NOTE)
  if (note === '') throw new Error('note is required')
  const category = CATEGORIES.includes(String(input.category)) ? String(input.category) : 'other'
  const entry = { id: randomUUID(), ts: new Date().toISOString(), amount: Math.round(amount * 100) / 100, note, category }
  const file = dataFile(ctx)
  mkdirSync(dirname(file), { recursive: true })
  appendFileSync(file, `${JSON.stringify(entry)}\n`)
  return entry
}

function removeEntry(ctx, id) {
  const entries = readEntries(ctx)
  const next = entries.filter(entry => entry.id !== id)
  if (next.length === entries.length) throw new Error('no entry with that id')
  writeEntries(ctx, next)
  return next.length
}

function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Everything the dashboard reads: totals, per-category, and the last seven days. */
function summary(entries) {
  const now = new Date()
  const today = dayKey(now)
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const weekStart = dayKey(monday)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const totals = { today: 0, week: 0, month: 0, all: 0, count: entries.length }
  const byCategory = {}
  const byDay = {}
  for (const entry of entries) {
    const key = dayKey(entry.ts ?? Date.now())
    totals.all += entry.amount
    if (key === today) totals.today += entry.amount
    if (key >= weekStart) totals.week += entry.amount
    if (key.startsWith(monthStart)) totals.month += entry.amount
    const category = typeof entry.category === 'string' && entry.category !== '' ? entry.category : 'other'
    byCategory[category] = (byCategory[category] ?? 0) + entry.amount
    byDay[key] = (byDay[key] ?? 0) + entry.amount
  }
  const days = []
  for (let back = 6; back >= 0; back -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - back)
    const key = dayKey(d)
    days.push({ day: key, amount: byDay[key] ?? 0 })
  }
  return { totals, byCategory, days }
}

function money(amount, currency) {
  const rounded = Math.round(amount * 100) / 100
  return `${currency}${rounded.toLocaleString('en-US')}`
}

function brief(entries, currency) {
  const { totals, byCategory } = summary(entries)
  const parts = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `${category} ${money(amount, currency)}`)
  return [
    `Today ${money(totals.today, currency)} | this week ${money(totals.week, currency)} | this month ${money(totals.month, currency)}`,
    parts.length === 0 ? 'No entries yet.' : `By category: ${parts.join(', ')}`,
  ].join('\n')
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(body)
}

function readJson(req) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) { rejectBody(new Error('body too large')); req.destroy(); return }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (chunks.length === 0) return resolveBody({})
      try { resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { rejectBody(new Error('body must be JSON')) }
    })
    req.on('error', rejectBody)
  })
}

export function apply(ctx, config) {
  const currency = currencyOf(config)
  const view = () => {
    const entries = readEntries(ctx)
    return { currency, entries: entries.slice(-200), ...summary(entries) }
  }

  ctx.tools.register(defineTool({
    name: 'outlay_add',
    description: 'Record one expense in the books. Call it once per amount the user mentions (200 taxi and 500 groceries = two calls).',
    parameters: {
      amount: { type: 'number', required: true, description: 'Amount in the app currency, a positive number (e.g. 200)' },
      note: { type: 'string', required: true, description: 'What it was for, in the user\'s own words (e.g. "taxi to office")' },
      category: { type: 'string', description: `One of: ${CATEGORIES.join(', ')}. Guess from the note; use other when unsure.` },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) {
      const entry = addEntry(ctx, args)
      return `Saved ${money(entry.amount, currency)} (${entry.category}) - ${entry.note}\n${brief(readEntries(ctx), currency)}`
    },
  }))

  ctx.tools.register(defineTool({
    name: 'outlay_list',
    description: 'Read the books: recent expenses (with their ids) and the totals for today, this week and this month.',
    parameters: {
      limit: { type: 'number', description: 'How many recent entries to show (default 15, max 50)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) {
      const limit = Math.min(Math.max(Number(args.limit) || 15, 1), 50)
      const entries = readEntries(ctx)
      if (entries.length === 0) return 'The books are empty. Tell me an expense and I will add it.'
      const recent = entries.slice(-limit).reverse()
        .map(entry => `${dayKey(entry.ts)}  ${money(entry.amount, currency).padStart(9)}  ${entry.category.padEnd(9)} ${entry.note}  [${entry.id.slice(0, 8)}]`)
      return [brief(entries, currency), '', `Last ${recent.length}:`, ...recent].join('\n')
    },
  }))

  ctx.tools.register(defineTool({
    name: 'outlay_remove',
    description: 'Delete one wrong expense by the id shown in outlay_list (its first 8 characters are enough).',
    parameters: {
      id: { type: 'string', required: true, description: 'The entry id, or its first 8 characters' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) {
      const wanted = String(args.id ?? '').trim()
      if (wanted === '') throw new Error('id is required')
      const match = readEntries(ctx).find(entry => entry.id === wanted || entry.id.startsWith(wanted))
      if (match === undefined) throw new Error(`no entry matches ${wanted}`)
      removeEntry(ctx, match.id)
      return `Removed ${money(match.amount, currency)} (${match.category}) - ${match.note}\n${brief(readEntries(ctx), currency)}`
    },
  }))

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/api/outlay/entries',
    handler: (req, res) => {
      if (req.method === 'GET') return sendJson(res, 200, view())
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'GET or POST' })
      readJson(req)
        .then((body) => {
          try {
            addEntry(ctx, body)
            sendJson(res, 200, view())
          } catch (error) {
            sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) })
          }
        })
        .catch(error => sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) }))
    },
  }), 'outlay: entries route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/api/outlay/delete',
    handler: (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' })
      readJson(req)
        .then((body) => {
          try {
            removeEntry(ctx, String(body.id ?? ''))
            sendJson(res, 200, view())
          } catch (error) {
            sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) })
          }
        })
        .catch(error => sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) }))
    },
  }), 'outlay: delete route')
}
