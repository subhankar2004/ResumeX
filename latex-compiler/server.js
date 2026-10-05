const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5001;
const COMPILE_TIMEOUT = 10000; // 10 seconds max

// Parse JSON bodies
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'latex-compiler' });
});

/**
 * POST /compile
 * Body: { latex_source: string }
 * Returns: PDF file or error
 */
app.post('/compile', async (req, res) => {
  const startTime = Date.now();
  let workDir;

  try {
    const { latex_source } = req.body;

    if (!latex_source || typeof latex_source !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid latex_source field' 
      });
    }

    // Create a unique temporary directory for this compilation
    const jobId = crypto.randomBytes(8).toString('hex');
    workDir = path.join('/tmp', `latex-${jobId}`);
    fs.mkdirSync(workDir, { recursive: true });

    // Write the LaTeX source to a file
    const texFile = path.join(workDir, 'document.tex');
    fs.writeFileSync(texFile, latex_source, 'utf8');

    // Run pdflatex with security constraints
    const command = `pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error -output-directory="${workDir}" "${texFile}"`;

    exec(command, { timeout: COMPILE_TIMEOUT, cwd: workDir }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;

      if (error) {
        // Compilation failed - parse error log
        const logFile = path.join(workDir, 'document.log');
        let errorLog = '';

        if (fs.existsSync(logFile)) {
          const logContent = fs.readFileSync(logFile, 'utf8');
          // Extract error lines (lines starting with !)
          const errorLines = logContent.split('\n').filter(line => line.startsWith('!'));
          errorLog = errorLines.join('\n') || logContent.slice(0, 1000); // First 1000 chars if no explicit errors
        } else {
          errorLog = stderr || stdout || 'Unknown compilation error';
        }

        // Clean up
        cleanup(workDir);

        return res.status(400).json({
          error: 'LaTeX compilation failed',
          compiler_log: errorLog,
          duration_ms: duration
        });
      }

      // Success - read the PDF
      const pdfFile = path.join(workDir, 'document.pdf');

      if (!fs.existsSync(pdfFile)) {
        cleanup(workDir);
        return res.status(500).json({
          error: 'PDF file not generated',
          compiler_log: stdout,
          duration_ms: duration
        });
      }

      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
      res.setHeader('X-Compile-Duration', duration.toString());

      const pdfStream = fs.createReadStream(pdfFile);
      pdfStream.pipe(res);

      // Clean up after sending
      pdfStream.on('end', () => {
        cleanup(workDir);
      });

      pdfStream.on('error', (err) => {
        console.error('Error streaming PDF:', err);
        cleanup(workDir);
      });
    });

  } catch (error) {
    console.error('Compilation error:', error);
    if (workDir) cleanup(workDir);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Clean up temporary directory
 */
function cleanup(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🔧 LaTeX compiler service running on port ${PORT}`);
  console.log(`⏱️  Compile timeout: ${COMPILE_TIMEOUT}ms`);
  console.log(`🔒 Security: shell-escape disabled, read-only filesystem (except /tmp)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  process.exit(0);
});
