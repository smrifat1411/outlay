# Outlay

Expense books an agent keeps for you: say what you spent, and the dashboard shows today, this
week and this month, per category and against monthly **budgets**, with one-click **CSV** export.
The assistant sits one floating button away — ask it to add, fix, delete, budget or report, and
the books change as you talk.

```bash
bin/acryl web       # or desktop, cli
```

Start a new app from it:

```bash
acryl new my-expenses --from https://github.com/smrifat1411/outlay
my-expenses/bin/acryl web
```

Tell the assistant inside what to build; it adds plugins to `plugins/` while the app runs.
`blend.yaml` is the app's definition (name, brand, what it grew from). Runtime data stays in
`.dsh/` and is not committed; the books themselves are `data/` (also not committed). The app has
its own port and its own window, so it runs beside any other.

Publishing: the Blends-registry entry is staged in `registry/` and validated by CI; the pull
request walkthrough is in [docs/PUBLISH.md](docs/PUBLISH.md).

## License

This project is yours: license it however you want, including closed source. It runs on the ACRYL Blends framework and DeepSeek Harness, both MIT
licensed; if you distribute a copy of the framework (for example a carried `runtime/`), keep their license notices with it.
