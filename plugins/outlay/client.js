// outlay (browser half): a header button and a floating books panel. No build step:
// CommonJS wrapped in window.__ModuleLoader__.load(...), React comes from the app.
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
  return dayKey(iso) === dayKey(new Date()) ? time : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${time}`
}

function Total({ label, amount, currency, strong }) {
  return h('div', { style: { flex: 1, textAlign: 'center' } },
    h('div', { style: { fontSize: 11, opacity: 0.65, letterSpacing: 0.4, textTransform: 'uppercase' } }, label),
    h('div', { style: { fontSize: strong ? 20 : 16, fontWeight: 700, marginTop: 2 } }, money(amount, currency)))
}

function BooksPanel({ onClose }) {
  const [state, setState] = React.useState({ loading: true })
  const load = React.useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    fetch('/api/outlay/entries', { cache: 'no-store' })
      .then((res) => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json() })
      .then((data) => setState({ loading: false, data }))
      .catch((error) => setState({ loading: false, error: String(error.message || error) }))
  }, [])
  React.useEffect(() => { load() }, [load])

  const data = state.data
  const currency = data ? data.currency : '$'
  const totals = data ? data.totals : { today: 0, week: 0, month: 0 }
  const entries = data ? data.entries.slice().reverse() : []
  const byCategory = data ? Object.entries(data.byCategory || {}).sort((a, b) => b[1] - a[1]) : []

  return h('div', {
    style: {
      position: 'fixed', top: 56, right: 16, width: 360, maxHeight: '72vh', display: 'flex', flexDirection: 'column',
      zIndex: 9999, background: 'var(--surface, #fff)', color: 'var(--text, #111)',
      border: '1px solid rgba(128,128,128,0.35)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.22)', overflow: 'hidden',
    },
  },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid rgba(128,128,128,0.2)' } },
      h('strong', { style: { flex: 1, fontSize: 14 } }, 'Outlay'),
      h('button', { type: 'button', onClick: load, title: 'Refresh', style: { fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(128,128,128,0.35)', borderRadius: 6, padding: '2px 8px', color: 'inherit' } }, '↻'),
      h('button', { type: 'button', onClick: onClose, title: 'Close', style: { fontSize: 13, cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' } }, '✕')),

    h('div', { style: { display: 'flex', gap: 4, padding: '10px 8px', borderBottom: '1px solid rgba(128,128,128,0.2)' } },
      h(Total, { label: 'Today', amount: totals.today, currency, strong: true }),
      h(Total, { label: 'This week', amount: totals.week, currency }),
      h(Total, { label: 'This month', amount: totals.month, currency })),

    byCategory.length > 0 && h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', borderBottom: '1px solid rgba(128,128,128,0.2)' } },
      byCategory.map(([category, amount]) => h('span', {
        key: category,
        style: { fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(11,114,133,0.12)', border: '1px solid rgba(11,114,133,0.3)' },
      }, `${LABEL[category] || category} ${money(amount, currency)}`))),

    h('div', { style: { flex: 1, overflowY: 'auto', padding: '4px 0' } },
      state.loading && h('div', { style: { padding: 12, fontSize: 12, opacity: 0.6 } }, 'Loading…'),
      state.error && h('div', { style: { padding: 12, fontSize: 12, color: '#d9480f' } }, 'Could not load: ' + state.error),
      !state.loading && !state.error && entries.length === 0 &&
        h('div', { style: { padding: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.6 } },
          'The books are empty. Tell the chat:', h('br'), h('em', null, '"taxi 12, groceries 40"')),
      entries.map((entry, index) => h('div', {
        key: entry.ts + index,
        style: { display: 'flex', alignItems: 'baseline', gap: 8, padding: '6px 12px', fontSize: 13 },
      },
        h('span', { style: { fontSize: 11, opacity: 0.55, minWidth: 62 } }, when(entry.ts)),
        h('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, entry.note),
        h('span', { style: { fontSize: 10, opacity: 0.55 } }, LABEL[entry.category] || entry.category),
        h('span', { style: { fontWeight: 600, minWidth: 62, textAlign: 'right' } }, money(entry.amount, currency))))),

    h('div', { style: { padding: '8px 12px', borderTop: '1px solid rgba(128,128,128,0.2)', fontSize: 11, opacity: 0.6 } },
      'Just say what you spent — the agent writes it down.'))
}

function OutlayAction() {
  const [open, setOpen] = React.useState(false)
  const [week, setWeek] = React.useState(null)
  React.useEffect(() => {
    let live = true
    fetch('/api/outlay/entries', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (live && data) setWeek({ amount: data.totals.week, currency: data.currency }) })
      .catch(() => {})
    return () => { live = false }
  }, [])

  return h(React.Fragment, null,
    h('button', {
      type: 'button',
      onClick: () => setOpen((value) => !value),
      title: 'Outlay — open the books',
      style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
    },
      h('span', { style: { fontSize: 11, opacity: 0.8 } }, '●'),
      h('span', null, 'Outlay'),
      week !== null && week.amount > 0 && h('span', { style: { fontSize: 11, opacity: 0.7 } }, money(week.amount, week.currency))),
    open && ReactDOM.createPortal(h(BooksPanel, { onClose: () => setOpen(false) }), document.body))
}

exports.inject = ['slots']

exports.apply = function apply(ctx) {
  ctx.slots.inject('conversation.session.header.actions', () =>
    ctx.slots.register({ name: 'conversation.session.header.actions', id: 'outlay', order: 42 }, OutlayAction))
}

return module.exports; } });
