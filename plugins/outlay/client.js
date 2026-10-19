// outlay (browser half): the dashboard that owns the main panel, a sidebar icon,
// and a floating "ask the builder" button that opens the agent when you want it.
window.__ModuleLoader__.load({ id: 'outlay', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

const React = require('react')
const h = React.createElement

const LABEL = {
  food: 'Food',
  travel: 'Travel',
  bills: 'Bills',
  shopping: 'Shopping',
  health: 'Health',
  fun: 'Fun',
  other: 'Other',
}

const API = '/api/outlay/entries'

const CSS = `
.ol-root { position:relative; height:100%; min-height:100%; overflow-y:auto;
  background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #111); font-size:14px; }
.ol-wrap { width:100%; max-width:1040px; margin:0 auto; padding:0 28px 96px; }

/* top bar */
.ol-top { position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:12px;
  padding:18px 0 14px; background: linear-gradient(var(--dsw-alias-bg-layer-1, #fff) 78%, transparent); }
.ol-brand { display:flex; flex-direction:column; gap:2px; flex:1; min-width:0; }
.ol-title { font-size:22px; font-weight:700; letter-spacing:-0.02em; margin:0; line-height:1.1; }
.ol-sub { margin:0; font-size:12px; color: var(--dsw-alias-label-tertiary, #666); }
.ol-pill { font-size:11px; padding:4px 10px; border-radius:999px; color: var(--dsw-alias-label-secondary, #444);
  border:1px solid var(--dsw-alias-border-l2, #e6e6e6); white-space:nowrap; }
.ol-iconbtn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:9px;
  border:1px solid var(--dsw-alias-border-l2, #e6e6e6); background:transparent; color:inherit; cursor:pointer; }
.ol-iconbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05)); }

/* cards */
.ol-grid { display:grid; gap:14px; }
.ol-kpis { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top:6px; }
.ol-card { background: var(--dsw-alias-bg-layer-2, #fafafa); border:1px solid var(--dsw-alias-border-l2, #e8e8e8);
  border-radius:16px; padding:16px 18px; }
.ol-kpi-label { font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color: var(--dsw-alias-label-tertiary, #666); }
.ol-kpi-value { font-size:28px; font-weight:700; letter-spacing:-0.03em; margin-top:8px; font-variant-numeric: tabular-nums; }
.ol-kpi-note { margin-top:6px; font-size:12px; color: var(--dsw-alias-label-tertiary, #666); }
.ol-kpi-accent .ol-kpi-value { color: var(--acryl-accent, #0b7285); }

/* add form */
.ol-add { display:grid; grid-template-columns: 120px 1fr 140px auto; gap:10px; align-items:center; margin-top:14px; }
.ol-add input, .ol-add select { width:100%; padding:11px 13px; border-radius:11px; font-size:13px;
  border:1px solid var(--dsw-alias-border-l3, #d8d8d8); background: var(--dsw-alias-bg-layer-1, #fff); color:inherit; outline:none; }
.ol-add input::placeholder { color: var(--dsw-alias-label-tertiary, #999); }
.ol-add input:focus, .ol-add select:focus { border-color: var(--acryl-accent, #0b7285);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acryl-accent, #0b7285) 18%, transparent); }
.ol-btn { padding:11px 20px; border-radius:11px; border:1px solid transparent; cursor:pointer; font-size:13px; font-weight:600;
  background: var(--acryl-accent, #0b7285); color:#fff; }
.ol-btn:hover { filter: brightness(1.06); }
.ol-btn:disabled { opacity:0.5; cursor:default; }

/* two column area */
.ol-split { display:grid; gap:14px; grid-template-columns: 1.6fr 1fr; margin-top:14px; }
@media (max-width: 860px) { .ol-split { grid-template-columns: 1fr; } .ol-add { grid-template-columns: 1fr 1fr; } }

.ol-head-row { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:14px; }
.ol-h2 { font-size:13px; font-weight:650; }
.ol-muted { font-size:11px; color: var(--dsw-alias-label-tertiary, #666); }

/* bars */
.ol-bars { display:flex; align-items:flex-end; gap:12px; height:150px; padding-top:6px; }
.ol-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end; }
.ol-bar { width:100%; max-width:46px; border-radius:8px 8px 4px 4px; min-height:4px;
  background: linear-gradient(var(--acryl-accent, #0b7285), color-mix(in srgb, var(--acryl-accent, #0b7285) 55%, transparent)); }
.ol-bar.today { outline:2px solid color-mix(in srgb, var(--acryl-accent, #0b7285) 35%, transparent); outline-offset:2px; }
.ol-day { font-size:10px; color: var(--dsw-alias-label-tertiary, #666); }

/* donut */
.ol-donut-wrap { display:flex; align-items:center; gap:18px; }
.ol-donut { width:118px; height:118px; border-radius:50%; flex:none; position:relative; }
.ol-donut::after { content:''; position:absolute; inset:20px; border-radius:50%;
  background: var(--dsw-alias-bg-layer-2, #fafafa); }
.ol-donut-hole { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
  z-index:1; text-align:center; }
.ol-donut-total { font-size:15px; font-weight:700; font-variant-numeric:tabular-nums; }
.ol-donut-cap { font-size:9px; letter-spacing:0.08em; text-transform:uppercase; color: var(--dsw-alias-label-tertiary, #666); }
.ol-legend { display:flex; flex-direction:column; gap:7px; font-size:12px; min-width:0; }
.ol-legend-row { display:grid; grid-template-columns: 9px 1fr auto; align-items:center; gap:8px; }
.ol-dot { width:9px; height:9px; border-radius:3px; }
.ol-legend-amount { font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary, #444); }

/* entries */
.ol-list { display:flex; flex-direction:column; margin-top:14px; }
.ol-daygroup { font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--dsw-alias-label-tertiary, #777);
  padding:14px 4px 6px; }
.ol-row { display:grid; grid-template-columns: 64px 1fr 104px 100px 28px; align-items:center; gap:12px;
  padding:11px 6px; border-bottom:1px solid var(--dsw-alias-border-l2, #eee); font-size:13px; border-radius:8px; }
.ol-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.035)); }
.ol-time { font-size:12px; color: var(--dsw-alias-label-tertiary, #666); }
.ol-note { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ol-chip { font-size:10px; padding:3px 9px; border-radius:999px; justify-self:start; white-space:nowrap;
  background: color-mix(in srgb, var(--acryl-accent, #0b7285) 12%, transparent);
  border:1px solid color-mix(in srgb, var(--acryl-accent, #0b7285) 30%, transparent); }
.ol-amount { text-align:right; font-variant-numeric: tabular-nums; font-weight:600; }
.ol-x { border:none; background:transparent; color: var(--dsw-alias-label-tertiary, #999); cursor:pointer; opacity:0; font-size:13px; padding:2px; }
.ol-row:hover .ol-x { opacity:1; }
.ol-x:hover { color: var(--dsw-alias-state-error-primary, #d9480f); }

/* states */
.ol-empty { text-align:center; padding:34px 12px; color: var(--dsw-alias-label-tertiary, #666); font-size:13px; line-height:1.8; }
.ol-chips { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-top:14px; }
.ol-example { font-size:11px; padding:5px 10px; border-radius:999px; border:1px dashed var(--dsw-alias-border-l3, #ccc);
  color: var(--dsw-alias-label-secondary, #555); cursor:pointer; background:transparent; }
.ol-example:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05)); }
.ol-error { color: var(--dsw-alias-state-error-primary, #d9480f); font-size:12px; margin-top:8px; }

/* floating assistant */
.ol-fab { position:fixed; right:24px; bottom:24px; z-index:9000; display:flex; align-items:center; gap:9px;
  padding:11px 18px 11px 14px; border-radius:999px; border:1px solid color-mix(in srgb, var(--acryl-accent, #0b7285) 45%, transparent);
  background: var(--dsw-alias-bg-layer-1, #fff); color: inherit; cursor:pointer; font-size:13px; font-weight:600;
  box-shadow: 0 12px 30px rgba(0,0,0,0.22); }
.ol-fab:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04)); transform: translateY(-1px); }
.ol-fab-spark { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%;
  background: var(--acryl-accent, #0b7285); color:#fff; font-size:13px; }
.ol-fab-hint { font-size:11px; font-weight:400; color: var(--dsw-alias-label-tertiary, #666); }
@media (max-width: 720px) { .ol-row { grid-template-columns: 56px 1fr 88px 28px; } .ol-row .ol-chip { display:none; } }
`

const PALETTE = ['#0b7285', '#f76707', '#5f3dc4', '#2f9e44', '#e8590c', '#c2255c', '#495057']

function ensureStyles() {
  if (document.getElementById('outlay-styles') !== null) return
  const style = document.createElement('style')
  style.id = 'outlay-styles'
  style.textContent = CSS
  document.head.appendChild(style)
}

function money(value, currency) {
  const rounded = Math.round(Number(value) * 100) / 100
  return `${currency}${rounded.toLocaleString('en-US')}`
}

function dayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function timeOf(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function dayLabel(key) {
  const today = dayKey(new Date())
  const yesterday = dayKey(new Date(Date.now() - 86400000))
  if (key === today) return 'Today'
  if (key === yesterday) return 'Yesterday'
  return new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
}

function monthName() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function useBooks() {
  const [state, setState] = React.useState({ loading: true })
  const load = React.useCallback(() => {
    fetch(API, { cache: 'no-store' })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data) => setState({ loading: false, data }))
      .catch((error) => setState({ loading: false, error: String(error.message || error) }))
  }, [])
  React.useEffect(() => { load() }, [load])
  const send = (path, body) => fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    setState({ loading: false, data })
    return data
  })
  return {
    state,
    reload: load,
    add: (entry) => send(API, entry),
    remove: (id) => send('/api/outlay/delete', { id }),
  }
}

function Kpi({ label, value, note, accent }) {
  return h('div', { className: `ol-card${accent ? ' ol-kpi-accent' : ''}` },
    h('div', { className: 'ol-kpi-label' }, label),
    h('div', { className: 'ol-kpi-value' }, value),
    note !== undefined && h('div', { className: 'ol-kpi-note' }, note))
}

function WeekChart({ days, currency }) {
  const max = Math.max(...days.map(d => d.amount), 1)
  const today = dayKey(new Date())
  return h('section', { className: 'ol-card' },
    h('div', { className: 'ol-head-row' },
      h('div', { className: 'ol-h2' }, 'Last 7 days'),
      h('div', { className: 'ol-muted' }, `peak ${money(max, currency)}`)),
    h('div', { className: 'ol-bars' },
      days.map((day) => h('div', { key: day.day, className: 'ol-col', title: `${dayLabel(day.day)} — ${money(day.amount, currency)}` },
        h('div', { className: `ol-bar${day.day === today ? ' today' : ''}`, style: { height: `${Math.max((day.amount / max) * 100, 3)}%` } }),
        h('div', { className: 'ol-day' }, ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${day.day}T12:00:00`).getDay()])))))
}

function Donut({ byCategory, currency, total }) {
  const rows = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const sum = rows.reduce((acc, row) => acc + row[1], 0) || 1
  let cursor = 0
  const stops = rows.map((row, index) => {
    const from = (cursor / sum) * 100
    cursor += row[1]
    const to = (cursor / sum) * 100
    return `${PALETTE[index % PALETTE.length]} ${from}% ${to}%`
  })
  const ring = stops.length === 0 ? 'var(--dsw-alias-border-l2, #eee) 0% 100%' : stops.join(', ')
  return h('section', { className: 'ol-card' },
    h('div', { className: 'ol-head-row' },
      h('div', { className: 'ol-h2' }, 'Where it goes'),
      h('div', { className: 'ol-muted' }, 'all time')),
    h('div', { className: 'ol-donut-wrap' },
      h('div', { className: 'ol-donut', style: { background: `conic-gradient(${ring})` } },
        h('div', { className: 'ol-donut-hole' },
          h('div', { className: 'ol-donut-total' }, money(total, currency)),
          h('div', { className: 'ol-donut-cap' }, 'total'))),
      h('div', { className: 'ol-legend' },
        rows.length === 0 && h('div', { className: 'ol-muted' }, 'Nothing yet'),
        rows.map(([category, amount], index) => h('div', { key: category, className: 'ol-legend-row' },
          h('span', { className: 'ol-dot', style: { background: PALETTE[index % PALETTE.length] } }),
          h('span', null, LABEL[category] || category),
          h('span', { className: 'ol-legend-amount' }, money(amount, currency)))))))
}

function QuickAdd({ onAdd }) {
  const [amount, setAmount] = React.useState('')
  const [note, setNote] = React.useState('')
  const [category, setCategory] = React.useState('other')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const submit = (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    onAdd({ amount: Number(amount), note, category })
      .then(() => { setAmount(''); setNote(''); setCategory('other') })
      .catch((cause) => setError(String(cause.message || cause)))
      .finally(() => setBusy(false))
  }

  return h('form', { onSubmit: submit, style: { display: 'flex', flexDirection: 'column' } },
    h('div', { className: 'ol-add' },
      h('input', { type: 'number', step: '0.01', min: '0.01', value: amount, placeholder: 'Amount',
        onChange: e => setAmount(e.target.value), required: true, 'aria-label': 'Amount' }),
      h('input', { type: 'text', value: note, placeholder: 'What was it for?  e.g. taxi to office',
        onChange: e => setNote(e.target.value), required: true, maxLength: 200, 'aria-label': 'Note' }),
      h('select', { value: category, onChange: e => setCategory(e.target.value), 'aria-label': 'Category' },
        Object.entries(LABEL).map(([value, label]) => h('option', { key: value, value }, label))),
      h('button', { type: 'submit', className: 'ol-btn', disabled: busy }, busy ? 'Adding…' : 'Add expense')),
    error !== '' && h('div', { className: 'ol-error' }, error))
}

function Entries({ entries, currency, onRemove, onExample }) {
  if (entries.length === 0) {
    return h('section', { className: 'ol-card', style: { marginTop: 14 } },
      h('div', { className: 'ol-empty' },
        'The books are empty.', h('br'),
        'Add an expense above, or tell the assistant — it writes it down for you.',
        h('div', { className: 'ol-chips' },
          ['taxi 12', 'coffee 4.5', 'groceries 40'].map(example => h('button', {
            key: example, type: 'button', className: 'ol-example',
            onClick: () => onExample(example),
          }, example)))))
  }

  const groups = []
  for (const entry of entries.slice().reverse()) {
    const key = dayKey(entry.ts)
    const last = groups[groups.length - 1]
    if (last !== undefined && last.key === key) last.items.push(entry)
    else groups.push({ key, items: [entry] })
  }

  return h('section', { className: 'ol-card', style: { marginTop: 14 } },
    h('div', { className: 'ol-head-row' },
      h('div', { className: 'ol-h2' }, 'Entries'),
      h('div', { className: 'ol-muted' }, `${entries.length} shown`)),
    h('div', { className: 'ol-list' },
      groups.map((group) => h('div', { key: group.key },
        h('div', { className: 'ol-daygroup' }, dayLabel(group.key)),
        group.items.map((entry) => h('div', { key: entry.id, className: 'ol-row' },
          h('span', { className: 'ol-time' }, timeOf(entry.ts)),
          h('span', { className: 'ol-note', title: entry.note }, entry.note),
          h('span', { className: 'ol-chip' }, LABEL[entry.category] || entry.category),
          h('span', { className: 'ol-amount' }, money(entry.amount, currency)),
          h('button', { type: 'button', className: 'ol-x', title: 'Delete this entry', onClick: () => onRemove(entry.id) }, '✕')))))))
}

function Dashboard() {
  ensureStyles()
  const books = useBooks()
  const data = books.state.data
  const currency = data ? data.currency : '$'
  const totals = data ? data.totals : { today: 0, week: 0, month: 0, all: 0, count: 0 }
  const [error, setError] = React.useState('')
  const remove = (id) => books.remove(id).catch((cause) => setError(String(cause.message || cause)))

  const askBuilder = (text) => {
    const layout = window.__outlayLayout
    if (typeof layout?.selectPanel === 'function') layout.selectPanel('conversation')
    if (typeof text === 'string') {
      const input = document.querySelector('[data-outlay-composer] textarea, textarea[aria-label]')
      if (input !== null) {
        input.focus()
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        setter?.call(input, `Add ${text}`)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  return h('div', { className: 'ol-root' },
    h('div', { className: 'ol-wrap' },
      h('div', { className: 'ol-top' },
        h('div', { className: 'ol-brand' },
          h('h1', { className: 'ol-title' }, 'Outlay'),
          h('p', { className: 'ol-sub' }, 'Say what you spent. The books keep themselves.')),
        h('span', { className: 'ol-pill' }, monthName()),
        h('span', { className: 'ol-pill' }, `in ${currency}`),
        h('button', { type: 'button', className: 'ol-iconbtn', title: 'Refresh', onClick: books.reload }, '↻')),

      books.state.loading && h('div', { className: 'ol-muted' }, 'Loading…'),
      books.state.error && h('div', { className: 'ol-error' }, `Could not load: ${books.state.error}`),

      data && h('div', { className: 'ol-grid ol-kpis' },
        h(Kpi, { label: 'Today', value: money(totals.today, currency), note: 'since midnight', accent: true }),
        h(Kpi, { label: 'This week', value: money(totals.week, currency), note: 'from Monday' }),
        h(Kpi, { label: 'This month', value: money(totals.month, currency), note: monthName() }),
        h(Kpi, { label: 'All time', value: money(totals.all, currency), note: `${totals.count} ${totals.count === 1 ? 'entry' : 'entries'}` })),

      h(QuickAdd, { onAdd: books.add }),
      error !== '' && h('div', { className: 'ol-error' }, error),

      data && h('div', { className: 'ol-split' },
        h(WeekChart, { days: data.days, currency }),
        h(Donut, { byCategory: data.byCategory, currency, total: totals.all })),

      data && h(Entries, { entries: data.entries, currency, onRemove: remove, onExample: askBuilder })),

    h('button', { type: 'button', className: 'ol-fab', onClick: () => askBuilder(), title: 'Open the assistant' },
      h('span', { className: 'ol-fab-spark' }, '✦'),
      h('span', null, 'Ask'),
      h('span', { className: 'ol-fab-hint' }, 'add or ask anything')))
}

function OutlayIcon({ size }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
    h('path', { d: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z',
      stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }),
    h('path', { d: 'M4 9h15', stroke: 'currentColor', strokeWidth: 1.7 }),
    h('path', { d: 'M8 14.5h4', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }))
}

exports.inject = ['slots']

exports.apply = function apply(ctx) {
  ensureStyles()
  window.__outlayLayout = ctx.get('layout')

  // The dashboard owns the central panel; the sidebar icon selects it.
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'outlay' }, Dashboard))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
    { name: 'sidebar.panellist', id: 'outlay', order: 40, label: 'Outlay' }, OutlayIcon))

  // The dashboard is this app's front door: open it once the panel exists. The
  // assistant stays behind the floating button, so it never gets in the way.
  if (typeof window.__outlayLayout?.selectPanel === 'function') window.__outlayLayout.selectPanel('outlay')
}

return module.exports; } });
