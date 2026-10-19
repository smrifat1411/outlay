// outlay (host half): the agent's hands on the books.
// Two tools the model calls (outlay_add, outlay_list) and one read-only HTTP route the
// browser panel fetches. Data is one append-only file: <app home>/data/outlay.jsonl
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'outlay'
export const inject = ['tools', 'webServer']

export const CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'health', 'fun', 'other']

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
      if (typeof entry?.amount === 'number') entries.push(entry)
    } catch {
      // A half-written line is skipped, never fatal.
    }
  }
  return entries
}

function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Totals the panel and the agent both read: today, this week (from Monday), this month, and by category. */
function summary(entries) {
  const now = new Date()
  const today = dayKey(now)
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const weekStart = dayKey(monday)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const totals = { today: 0, week: 0, month: 0, all: 0 }
  const byCategory = {}
  for (const entry of entries) {
    const key = dayKey(entry.ts ?? Date.now())
    totals.all += entry.amount
    if (key === today) totals.today += entry.amount
    if (key >= weekStart) totals.week += entry.amount
    if (key.startsWith(monthStart)) totals.month += entry.amount
    const category = typeof entry.category === 'string' && entry.category !== '' ? entry.category : 'other'
    byCategory[category] = (byCategory[category] ?? 0) + entry.amount
  }
  return { totals, byCategory }
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

export function apply(ctx, config) {
  const currency = currencyOf(config)

  ctx.tools.register(defineTool({
    name: 'outlay_add',
    description: 'Record one expense in the books. Call it once per amount the user mentions (200 taxi and 500 groceries = two calls).',
    parameters: {
      amount: { type: 'number', required: true, description: 'Amount in the app currency, a positive number (e.g. 200)' },
      note: { type: 'string', required: true, description: 'What it was for, in the user\'s own words (e.g. "taxi to office")' },
      category: { type: 'string', description: `One of: ${CATEGORIES.join(', ')}. Guess from the note; use other when unsure.` },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args, exec) {
      const amount = Number(args.amount)
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('amount must be a positive number')
      const note = String(args.note ?? '').trim()
      if (note === '') throw new Error('note is required')
      const category = CATEGORIES.includes(String(args.category)) ? String(args.category) : 'other'
      const cwd = exec?.agent?.session?.header?.cwd
      const entry = { ts: new Date().toISOString(), amount, note, category, ...(typeof cwd === 'string' ? { cwd } : {}) }
      const file = dataFile(ctx)
      mkdirSync(dirname(file), { recursive: true })
      appendFileSync(file, `${JSON.stringify(entry)}\n`)
      return `Saved ${money(amount, currency)} (${category}) - ${note}\n${brief(readEntries(ctx), currency)}`
    },
  }))

  ctx.tools.register(defineTool({
    name: 'outlay_list',
    description: 'Read the books: recent expenses and the totals for today, this week and this month.',
    parameters: {
      limit: { type: 'number', description: 'How many recent entries to show (default 15, max 50)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) {
      const limit = Math.min(Math.max(Number(args.limit) || 15, 1), 50)
      const entries = readEntries(ctx)
      if (entries.length === 0) return 'The books are empty. Tell me an expense and I will add it.'
      const recent = entries.slice(-limit).reverse()
        .map(entry => `${dayKey(entry.ts)}  ${money(entry.amount, currency).padStart(9)}  ${entry.category}  ${entry.note}`)
      return [brief(entries, currency), '', `Last ${recent.length}:`, ...recent].join('\n')
    },
  }))

  // The browser panel reads this; nothing else writes it, so the route is read-only.
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/api/outlay/entries',
    handler: (_req, res) => {
      const entries = readEntries(ctx)
      const body = JSON.stringify({ currency, entries: entries.slice(-50), ...summary(entries) })
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
      res.end(body)
    },
  }), 'outlay: entries route')
}
