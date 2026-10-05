import axios from 'axios';
import pool from '../config/database';
import { config } from '../config';

export const CompileService = {
  // Compile LaTeX source to PDF
  async compileLatex(latexSource: string): Promise<{ pdfBuffer: Buffer; duration: number }> {
    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${config.latexCompiler.url}/compile`,
        { latex_source: latexSource },
        {
          responseType: 'arraybuffer',
          timeout: config.latexCompiler.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const duration = Date.now() - startTime;
      const pdfBuffer = Buffer.from(response.data);

      return { pdfBuffer, duration };
    } catch (error: any) {
      // If the response has data, it might be an error JSON
      if (error.response && error.response.data) {
        const errorData = JSON.parse(Buffer.from(error.response.data).toString('utf8'));
        throw new Error(errorData.compiler_log || errorData.error || 'Compilation failed');
      }

      throw new Error(error.message || 'Failed to compile LaTeX');
    }
  },

  // Log compile job to database
  async logCompileJob(
    resumeId: string,
    status: 'pending' | 'success' | 'error',
    durationMs: number,
    errorLog?: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO compile_jobs (resume_id, status, duration_ms, error_log)
       VALUES ($1, $2, $3, $4)`,
      [resumeId, status, durationMs, errorLog || null]
    );
  },
};
