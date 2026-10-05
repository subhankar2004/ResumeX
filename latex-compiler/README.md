# LaTeX Compiler Microservice

Sandboxed LaTeX compilation service for ResumeX.

## Security Features

This service is designed with security as the top priority:

1. **Isolated Network** - Runs on internal-only Docker network with no internet access
2. **Resource Limits** - Memory (512MB) and CPU (1 core) limits enforced at container level
3. **Read-Only Filesystem** - Container filesystem is read-only except `/tmp` (tmpfs)
4. **No Shell Escape** - pdflatex runs with `--no-shell-escape` flag
5. **Timeout Protection** - 10 second max execution time per compile job
6. **Non-Root User** - Runs as `compiler` user (not root)
7. **Dropped Capabilities** - All Linux capabilities dropped (`cap_drop: ALL`)

## API

### POST /compile

Compiles LaTeX source to PDF.

**Request:**
```json
{
  "latex_source": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
}
```

**Response (Success):**
- Content-Type: `application/pdf`
- Body: PDF file bytes
- Header: `X-Compile-Duration` with milliseconds

**Response (Error):**
```json
{
  "error": "LaTeX compilation failed",
  "compiler_log": "! Undefined control sequence...",
  "duration_ms": 145
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "latex-compiler"
}
```

## Usage

This service is meant to be called only by the backend service. It's not exposed to the public internet.

```javascript
// Example from backend
const response = await axios.post('http://latex-compiler:5001/compile', {
  latex_source: texString
}, {
  responseType: 'arraybuffer',
  timeout: 15000
});

// response.data contains PDF bytes
```

## Development

```bash
# Install dependencies
npm install

# Run locally (requires pdflatex installed)
node server.js
```

## Docker Build

```bash
docker build -t resumex-latex-compiler .
```

See `docker-compose.yml` for full deployment configuration with security constraints.
