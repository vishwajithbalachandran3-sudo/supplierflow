# Gmail live automation

1. Open https://script.google.com and create a new project.
2. Paste `Code.gs` into the editor. In Project Settings, enable showing `appsscript.json`, then replace it with this folder's manifest.
3. Choose a private access key with at least 16 characters. In the editor run `configureSupplierflow('your-private-key')` once and approve Gmail permissions.
4. Deploy > New deployment > Web app. Execute as **Me**. Allow access to **Anyone** (the private key still protects requests). Copy the `/exec` URL.
5. In Supplierflow Settings select Gmail, enter the From address, CC recipients, deployment URL, and the same access key. Enable live Gmail automation and save.

Supplierflow synchronizes active orders when a check runs. Apps Script checks every six hours, sends the initial confirmation, sends overdue reminders at the configured interval, and searches Gmail for PO-linked replies.
