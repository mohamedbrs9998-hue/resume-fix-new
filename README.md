# ResumeFix AI — hardened production build

This version upgrades the project with stronger queue authenticity, upload inspection, and cleaner production build defaults.

## What changed

- **Verified QStash signatures** on the internal worker endpoint using the official `@upstash/qstash` receiver
- **Defense-in-depth queue auth**: the worker now requires both the forwarded internal bearer token and a valid `Upstash-Signature`
- **Uploaded file inspection** before parsing or storage:
  - checks file size
  - checks magic bytes / actual file signature
  - validates DOCX structure from the ZIP archive
  - blocks macro-enabled DOCX files (`vbaProject.bin`)
  - blocks embedded executable/script-like files inside uploaded archives
  - records upload SHA-256 and scan metadata in the order row
- **Build cleanup**:
  - standalone Next.js output
  - `clean` script to remove stale build artifacts
  - `.gitignore` for deployment hygiene
  - stricter Node engine declaration

## Setup

```bash
npm install
cp .env.example .env.local
```

## New environment variables

Add these for QStash verification:

```bash
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
QSTASH_REGION=
```

## Database change

Run the updated schema file again so `orders` includes:

- `file_scan_json`
- `upload_sha256`

```sql
supabase/schema.sql
```

## Deployment notes

1. Set all env vars in Vercel
2. Make sure QStash forwards the `Authorization` header already configured by this app
3. Keep `QUEUE_DRIVER=qstash` in production
4. Keep `MOCK_MODE=false` in production
5. Use the worker endpoint only through QStash in production

## Worker security model

The internal worker route now validates **both**:

- the internal bearer header
- the `Upstash-Signature` JWT from QStash

This means even if one mechanism is exposed, the queue endpoint is still better protected.

## Upload security model

The app now trusts the actual uploaded file bytes more than the filename or browser MIME type.

Examples of uploads now rejected:

- renamed executable pretending to be a PDF
- malformed ZIP renamed as `.docx`
- macro-enabled DOCX
- DOCX archive containing suspicious script or executable files

## Useful scripts

```bash
npm run clean
npm run build
npm run check
```
