---
name: user-doc-parse
description: Activated automatically when reading PDF, PPTX, DOCX, or XLSX files. Converts documents to text using the liteparse CLI before processing. Triggered by "read this PDF", "check this PPTX", or "summarize this document".
disable-model-invocation: false
allowed-tools: Bash(lit:*), Bash(npx:*), Read, Write
effort: low
---

# liteparse - Document Parser

Converts PDF, PPTX, DOCX, and XLSX files to text so Claude Code can process them.

## Iron Law

1. Do not try to read binary files directly

## Usage

When the user asks you to read a document file (PDF/PPTX/DOCX/XLSX), follow these steps.

### Steps

1. **Convert to text with liteparse**

Check if the `lit` command is available. If not, use `npx`:

```bash
# When lit is available
lit parse <file_path>

# When lit is not available
npx -y @llamaindex/liteparse parse <file_path>
```

2. **When only specific pages are needed**

```bash
lit parse <file_path> --target-pages "1-5,10"
```

3. **When you want to save the output to a file**

```bash
lit parse <file_path> -o <output_path>.md
```

4. **Read the converted result and process it according to the user's request**

## Supported Formats

- PDF (OCR supported)
- PPTX
- DOCX
- XLSX
- Images (JPG, PNG, etc. — read via OCR)

## Notes

- For large documents, use `--target-pages` to convert only the pages you need
- If the converted result is long, save it to a file first and then read it with the Read tool
