# GENPDF — Free PDF Tools

Fast. Private. Works in your browser.

## Features

- **26 PDF Tools** — Merge, Split, Compress, Edit, Convert, Sign and more
- **10 Themes** — Light, Dark, Warm, Ocean, Forest, Sunset, Midnight, Rose, Slate, Aurora
- **AI-Powered** — PDF to Word & PDF to Excel use Claude AI (Anthropic)
- **Privacy First** — All browser-based tools run 100% locally. No upload, no server.

## Quick Start

```bash
npm install
npm run dev
```

## AI Tools Setup (PDF to Word & PDF to Excel)

These two tools use the [Anthropic Claude API](https://console.anthropic.com) for vision-based conversion.

1. Get your API key from https://console.anthropic.com/settings/keys
2. Create a `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

3. The tools will work automatically. Without the key, you'll see a clear error message.

## All Tools

### Browser-based (No API needed)
- Merge PDF, Split PDF, Reorder Pages, Delete Pages
- Add PDF Page, Add Blank Page, Add Index Page
- Add Text, Add Page Numbers, Add Watermark, Add Signature, Add QR Code
- Edit Metadata, Remove Watermark
- Protect PDF, Unlock PDF, Compress PDF (10 presets)
- PDF to Text, PDF to Image
- Image to PDF, Screenshot to PDF, Excel to PDF, Text to PDF
- Resume Builder

### AI-Powered (Needs ANTHROPIC_API_KEY)
- **PDF to Word** — Claude Vision reads each page, reconstructs as .doc
- **PDF to Excel** — Claude Vision extracts all tables as .xlsx with preview

## Server Requirements (for Protect/Unlock PDF)

Protect PDF and Unlock PDF use **qpdf** (installed on server) for real AES-256 encryption.

### Ubuntu/Debian
```bash
sudo apt install qpdf
```

### macOS
```bash
brew install qpdf
```

### Vercel / Railway / Fly.io / Docker
Add to your Dockerfile:
```dockerfile
RUN apt-get install -y qpdf
```

**Privacy guarantee:** PDF files are written to a random `/tmp/.{hex}.pdf` path (mode 0600), processed immediately, and deleted before the API response is sent. Zero persistence. Nothing is logged.
