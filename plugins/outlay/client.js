// outlay (browser half): the dashboard that owns the main panel, a sidebar icon,
// and a small popover on the conversation header. No build step.
window.__ModuleLoader__.load({ id: 'outlay', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

const React = require('react')
const ReactDOM = require('react-dom')
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
.ol-root { display:flex; flex-direction:column; min-height:100%; height:100%; overflow-y:auto;
  background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #111);
  font-size: 14px; }
.ol-wrap { width:100%; max-width: 980px; margin:0 auto; padding: 28px 24px 48px; display:flex; flex-direction:column; gap: 22px; }
.ol-head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.ol-title { font-size: 26px; font-weight: 700; letter-spacing:-0.02em; margin:0; }
.ol-sub { margin:4px 0 0; color: var(--dsw-alias-label-tertiary, #666); font-size: 13px; }
.ol-month { font-size: 12px; text-transform: uppercase; letter-spacing:0.08em; color: var(--dsw-alias-label-tertiary, #666); }
.ol-card { background: var(--dsw-alias-bg-layer-2, #fafafa); border: 1px solid var(--dsw-alias-border-l2, #e6e6e6); border-radius: 14px; padding: 16px; }
.ol-stats { display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.ol-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--dsw-alias-label-tertiary, #666); }
.ol-stat-value { font-size: 26px; font-weight: 700; margin-top: 6px; letter-spacing: -0.02em; }
.ol-stat-note { font-size: 12px; color: var(--dsw-alias-label-tertiary, #666); margin-top: 4px; }
.ol-add { display:grid; grid-template-columns: 110px 1fr 130px auto; gap: 8px; align-items:center; }
.ol-add input, .ol-add select { width:100%; padding: 9px 11px; border-radius: 9px; font-size: 13px;
  border: 1px solid var(--dsw-alias-border-l3, #d8d8d8); background: var(--dsw-alias-bg-layer-1, #fff);
  color: inherit; outline: none; }
.ol-add input:focus, .ol-add select:focus { border-color: var(--acryl-accent, #0b7285); }
.ol-btn { padding: 9px 16px; border-radius: 9px; border: 1px solid transparent; cursor:pointer; font-size: 13px; font-weight: 600;
  background: var(--acryl-accent, #0b7285); color: #fff; }
.ol-btn:disabled { opacity: 0.5; cursor: default; }
.ol-btn-ghost { background: transparent; color: inherit; border-color: var(--dsw-alias-border-l3, #d8d8d8); font-weight: 500; }
.ol-btn-ghost:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05)); }
.ol-section-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom: 12px; }
.ol-section-title { font-size: 13px; font-weight: 600; }
.ol-muted { color: var(--dsw-alias-label-tertiary, #666); font-size: 12px; }
.ol-bars { display:flex; align-items:flex-end; gap: 10px; height: 120px; }
.ol-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end; }
.ol-bar { width:100%; max-width: 44px; border-radius: 6px 6px 3px 3px; background: var(--acryl-accent, #0b7285); opacity: 0.85; min-height: 3px; }
.ol-bar-day { font-size: 10px; color: var(--dsw-alias-label-tertiary, #666); }
.ol-cat { display:flex; flex-direction:column; gap: 10px; }
.ol-cat-row { display:grid; grid-template-columns: 92px 1fr 92px; gap: 12px; align-items:center; font-size: 13px; }
.ol-cat-track { height: 8px; border-radius: 999px; background: var(--dsw-alias-bg-layer-3, #efefef); overflow:hidden; }
.ol-cat-fill { height:100%; border-radius: 999px; background: var(--acryl-accent, #0b7285); }
.ol-cat-amount { text-align:right; font-variant-numeric: tabular-nums; }
.ol-list { display:flex; flex-direction:column; }
.ol-row { display:grid; grid-template-columns: 96px 1fr 88px 96px 28px; gap: 12px; align-items:center;
  padding: 10px 4px; border-bottom: 1px solid var(--dsw-alias-border-l2, #eee); font-size: 13px; }
.ol-row:last-child { border-bottom: none; }
.ol-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.03)); }
.ol-row-when { color: var(--dsw-alias-label-tertiary, #666); font-size: 12px; }
.ol-row-note { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ol-chip { font-size: 10px; padding: 2px 7px; border-radius: 999px; justify-self:start;
  background: color-mix(in srgb, var(--acryl-accent, #0b7285) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--acryl-accent, #0b7285) 32%, transparent); }
.ol-row-amount { text-align:right; font-variant-numeric: tabular-nums; font-weight: 600; }
.ol-x { border:none; background:transparent; color: var(--dsw-alias-label-tertiary, #888); cursor:pointer; font-size: 14px; opacity: 0; padding: 2px; }
.ol-row:hover .ol-x { opacity: 1; }
.ol-x:hover { color: var(--dsw-alias-state-error-primary, #d9480f); }
.ol-empty { padding: 28px 8px; text-align:center; color: var(--dsw-alias-label-tertiary, #666); font-size: 13px; line-height: 1.7; }
.ol-error { color: var(--dsw-alias-state-error-primary, #d9480f); font-size: 12px; }
.ol-pop { position:fixed; top:56px; right:16px; width:370px; max-height:75vh; overflow:auto; z-index:9999;
  background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #111);
  border:1px solid var(--dsw-alias-border-l3, #ddd); border-radius:14px; box-shadow: 0 16px 40px rgba(0,0,0,0.22); padding:14px; }
@media (max-width: 720px) {
  .ol-add { grid-template-columns: 1fr 1fr; }
  .ol-row { grid-template-columns: 76px 1fr 84px 28px; }
  .ol-row .ol-chip { display:none; }
}
`

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

function when(iso) {
  const d = new Date(iso)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return dayKey(iso) === dayKey(new Date()) ? `Today ${time}` : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${time}`
}

function monthName() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function useBooks(enabled) {
  const [state, setState] = React.useState({ loading: true })
  const load = React.useCallback(() => {
    fetch(API, { cache: 'no-store' })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
      .then((data) => setState({ loading: false, data }))
      .catch((error) => setState({ loading: false, error: String(error.message || error) }))
  }, [])
  React.useEffect(() => { if (enabled) load() }, [enabled, load])
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

function Stats({ totals, currency }) {
  return h('div', { className: 'ol-stats' },
    h('div', { className: 'ol-card' },
      h('div', { className: 'ol-stat-label' }, 'Today'),
      h('div', { className: 'ol-stat-value' }, money(totals.today, currency)),
      h('div', { className: 'ol-stat-note' }, 'since midnight')),
    h('div', { className: 'ol-card' },
      h('div', { className: 'ol-stat-label' }, 'This week'),
      h('div', { className: 'ol-stat-value' }, money(totals.week, currency)),
      h('div', { className: 'ol-stat-note' }, 'from Monday')),
    h('div', { className: 'ol-card' },
      h('div', { className: 'ol-stat-label' }, 'This month'),
      h('div', { className: 'ol-stat-value' }, money(totals.month, currency)),
      h('div', { className: 'ol-stat-note' }, `${totals.count} ${totals.count === 1 ? 'entry' : 'entries'} in all`)))
}

function Week({ days, currency }) {
  const max = Math.max(...days.map(d => d.amount), 1)
  return h('section', { className: 'ol-card' },
    h('div', { className: 'ol-section-head' },
      h('div', { className: 'ol-section-title' }, 'Last 7 days'),
      h('div', { className: 'ol-muted' }, `peak ${money(max, currency)}`)),
    h('div', { className: 'ol-bars' },
      days.map((day) => h('div', { key: day.day, className: 'ol-bar-col', title: `${day.day} ${money(day.amount, currency)}` },
        h('div', { className: 'ol-bar', style: { height: `${Math.max((day.amount / max) * 100, 3)}%` } }),
        h('div', { className: 'ol-bar-day' }, ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(`${day.day}T12:00:00`).getDay()])))))
}

function Categories({ byCategory, currency }) {
  const rows = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const max = Math.max(...rows.map(row => row[1]), 1)
  if (rows.length === 0) return null
  return h('section', { className: 'ol-card' },
    h('div', { className: 'ol-section-head' },
      h('div', { className: 'ol-section-title' }, 'Where it goes'),
      h('div', { className: 'ol-muted' }, 'all time')),
    h('div', { className: 'ol-cat' },
      rows.map(([category, amount]) => h('div', { key: category, className: 'ol-cat-row' },
        h('span', null, LABEL[category] || category),
        h('div', { className: 'ol-cat-track' },
          h('div', { className: 'ol-cat-fill', style: { width: `${Math.max((amount / max) * 100, 2)}%` } })),
        h('span', { className: 'ol-cat-amount' }, money(amount, currency))))))
}

function Entries({ entries, currency, onRemove }) {
  if (entries.length === 0) {
    return h('section', { className: 'ol-card' },
      h('div', { className: 'ol-empty' }, 'The books are empty.', h('br'),
        'Type an expense above, or tell the agent in chat — “taxi 12, coffee 4.5”.'))
  }
  return h('section', { className: 'ol-card' },
    h('div', { className: 'ol-section-head' },
      h('div', { className: 'ol-section-title' }, 'Recent entries'),
      h('div', { className: 'ol-muted' }, `${entries.length} shown`)),
    h('div', { className: 'ol-list' },
      entries.slice().reverse().map((entry) => h('div', { key: entry.id || `${entry.ts}-${entry.note}`, className: 'ol-row' },
        h('span', { className: 'ol-row-when' }, when(entry.ts)),
        h('span', { className: 'ol-row-note', title: entry.note }, entry.note),
        h('span', { className: 'ol-chip' }, LABEL[entry.category] || entry.category),
        h('span', { className: 'ol-row-amount' }, money(entry.amount, currency)),
        h('button', { type: 'button', className: 'ol-x', title: 'Delete this entry', onClick: () => onRemove(entry.id) }, '✕')))))
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

  return h('form', { className: 'ol-card', onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 8 } },
    h('div', { className: 'ol-add' },
      h('input', { type: 'number', step: '0.01', min: '0.01', value: amount, placeholder: 'Amount',
        onChange: e => setAmount(e.target.value), required: true, 'aria-label': 'Amount' }),
      h('input', { type: 'text', value: note, placeholder: 'What was it for? (e.g. taxi to office)',
        onChange: e => setNote(e.target.value), required: true, maxLength: 200, 'aria-label': 'Note' }),
      h('select', { value: category, onChange: e => setCategory(e.target.value), 'aria-label': 'Category' },
        Object.entries(LABEL).map(([value, label]) => h('option', { key: value, value }, label))),
      h('button', { type: 'submit', className: 'ol-btn', disabled: busy }, busy ? 'Adding…' : 'Add')),
    error !== '' && h('div', { className: 'ol-error' }, error))
}

function Dashboard() {
  ensureStyles()
  const books = useBooks(true)
  const data = books.state.data
  const currency = data ? data.currency : '$'
  const totals = data ? data.totals : { today: 0, week: 0, month: 0, count: 0 }
  const days = data ? data.days : []
  const byCategory = data ? data.byCategory : {}
  const entries = data ? data.entries : []
  const [error, setError] = React.useState('')
  const remove = (id) => books.remove(id).catch((cause) => setError(String(cause.message || cause)))

  return h('div', { className: 'ol-root' },
    h('div', { className: 'ol-wrap' },
      h('header', { className: 'ol-head' },
        h('div', null,
          h('h1', { className: 'ol-title' }, 'Outlay'),
          h('p', { className: 'ol-sub' }, 'Say what you spent. The books keep themselves.')),
        h('div', { className: 'ol-month' }, monthName())),
      h(QuickAdd, { onAdd: books.add }),
      error !== '' && h('div', { className: 'ol-error' }, error),
      books.state.loading && h('div', { className: 'ol-muted' }, 'Loading…'),
      books.state.error && h('div', { className: 'ol-error' }, `Could not load: ${books.state.error}`),
      data && h(Stats, { totals, currency }),
      data && h(Week, { days, currency }),
      data && h(Categories, { byCategory, currency }),
      data && h(Entries, { entries, currency, onRemove: remove })))
}

function OutlayIcon({ size }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
    h('path', { d: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z',
      stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }),
    h('path', { d: 'M4 9h15', stroke: 'currentColor', strokeWidth: 1.7 }),
    h('path', { d: 'M8 14.5h4', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }))
}

function HeaderAction() {
  ensureStyles()
  const [open, setOpen] = React.useState(false)
  const [week, setWeek] = React.useState(null)
  React.useEffect(() => {
    let live = true
    fetch(API, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (live && data) setWeek({ amount: data.totals.week, currency: data.currency }) })
      .catch(() => {})
    return () => { live = false }
  }, [])

  const panel = open && h(Popover, { onClose: () => setOpen(false) })
  return h(React.Fragment, null,
    h('button', {
      type: 'button',
      onClick: () => setOpen((value) => !value),
      title: 'Outlay — open the books',
      style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
    },
      h('span', { style: { fontSize: 11, opacity: 0.8 } }, '\u25CF'),
      h('span', null, 'Outlay'),
      week !== null && week.amount > 0 && h('span', { style: { fontSize: 11, opacity: 0.7 } }, money(week.amount, week.currency))),
    panel && ReactDOM.createPortal(panel, document.body))
}

function Popover({ onClose }) {
  const books = useBooks(true)
  const data = books.state.data
  const currency = data ? data.currency : '$'
  const totals = data ? data.totals : { today: 0, week: 0, month: 0, count: 0 }
  return h('div', { className: 'ol-pop' },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
      h('strong', { style: { flex: 1 } }, 'Outlay'),
      h('button', { type: 'button', className: 'ol-btn ol-btn-ghost', onClick: books.reload }, 'Refresh'),
      h('button', { type: 'button', className: 'ol-btn ol-btn-ghost', onClick: onClose }, 'Close')),
    data && h(Stats, { totals, currency }),
    books.state.loading && h('div', { className: 'ol-muted', style: { marginTop: 10 } }, 'Loading…'),
    data && h('div', { style: { marginTop: 12 } },
      h(Entries, { entries: data.entries, currency, onRemove: (id) => books.remove(id) })))
}

exports.inject = ['slots']

exports.apply = function apply(ctx) {
  ensureStyles()

  // The dashboard owns the central panel; the sidebar icon selects it.
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'outlay' }, Dashboard))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
    { name: 'sidebar.panellist', id: 'outlay', order: 40, label: 'Outlay' }, OutlayIcon))

  // Chat stays where it is; this is the shortcut while you are in a conversation.
  ctx.slots.inject('conversation.session.header.actions', () =>
    ctx.slots.register({ name: 'conversation.session.header.actions', id: 'outlay', order: 42 }, HeaderAction))

  // The dashboard is this app's front door: open it once the panel exists. The
  // conversation stays one sidebar entry away, so the assistant stays optional.
  const layout = ctx.get('layout')
  if (typeof layout?.selectPanel === 'function') layout.selectPanel('outlay')
}

return module.exports; } });
