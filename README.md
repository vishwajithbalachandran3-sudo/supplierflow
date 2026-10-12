# Supplierflow

A responsive, browser-local application prototype for purchasing teams who track supplier shipments in Excel. It opens directly to a purchase order register, with persistent navigation, independent scrolling, and an adjacent order inspector. Built with plain HTML, CSS, and JavaScript, with a locally bundled SheetJS spreadsheet reader.

## Preview

Serve `dist/` using any static HTTP server. For example, from this folder:

```sh
python -m http.server 4173 --directory dist
```

Open http://localhost:4173. No build step is required.

## Working features

- Overview metrics, purchase order filters, search, sorting, pagination, supplier views, and order details.
- A dedicated follow-up queue for due messages, saved drafts, and escalations.
- Manual purchase order creation and editing with supplier-code, duplicate, and date validation.
- A fixed application workspace with an order inspector on desktop and order drawers on smaller screens.
- Local XLSX, XLS, and CSV import with four required fields: Supplier Name, Supplier Code, Shipping Date, and PO Number. Imports can replace all old orders or add new orders.
- Personalized email templates and drafts. Drafts can be opened with a local email application. Simulated sending is explicitly labeled and never delivers email.
- Supplier reply analysis detects revised shipping dates or shipped status and updates the order and conversation history.
- Configurable two-day reminders and escalation rules, plus per-supplier automation toggles and reusable supplier email profiles.
- Local persistence, CSV export, full workspace JSON backup/restore, sample-data reset confirmation, and accessible responsive dialogs.

## Prototype boundaries

No mailbox, email API, server database, background worker, or scheduler is connected. Nothing is sent automatically. Conversations start as example data and can be recorded manually. Local state is specific to the current browser and origin. A production application needs provider OAuth, a shared database, a scheduled backend job, thread-based reply matching, delivery deduplication, and appropriate access controls. Supplier `.example` email addresses in the sample dataset are deliberately non-deliverable.

Spreadsheet dates support native Excel dates, `YYYY-MM-DD`, and `MM/DD/YYYY`. Imports require Supplier Name, Supplier Code, Shipping Date, and PO Number. Supplier email addresses and automation settings are managed in the Suppliers screen and retained by supplier code when imported orders are replaced. Existing supplier-code/PO pairs are skipped when adding rows. Individual files are limited to 10 MB and 5,000 rows.

## Source

- `dist/core.js`: date handling, validation, templates, automation decisions, and sample data.
- `dist/app.js`: screens, accessible UI, imports, local persistence, and user actions.
- `dist/styles.css`: responsive visual system.
- `dist/workspace.js`: order inspector, follow-up queue, manual order forms, and application startup.
- `dist/workspace.css`: fixed application layout, compact controls, and responsive workspace panels.
- `dist/vendor/xlsx.full.min.js`: SheetJS CE 0.20.3, Apache-2.0, distributed by cdn.sheetjs.com.

The deployment is configured by `.openai/hosting.json`.
