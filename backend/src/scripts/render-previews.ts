import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import pool from '../config/database';
import { TemplateService } from '../services/template.service';
import { CompileService } from '../services/compile.service';
import { sampleFor } from '../data/sample-resume';

// Compiles every template with sample data to <outDir>/<slug>.pdf for the template gallery.
// Usage: npm run render-previews -- [outDir]
const outDir = resolve(process.argv[2] || join(__dirname, '../../template-previews'));

const renderPreviews = async () => {
  mkdirSync(outDir, { recursive: true });
  const templates = await TemplateService.getTemplates('pro', true);

  for (const template of templates) {
    const latex = await TemplateService.populateTemplate(template.id, sampleFor(template.tags));
    const { pdfBuffer } = await CompileService.compileLatex(latex);
    writeFileSync(join(outDir, `${template.slug}.pdf`), pdfBuffer);
    console.log(`✓ ${template.slug}.pdf`);
  }

  await pool.end();
};

renderPreviews().catch((error) => {
  console.error('❌ Preview rendering failed:', error.message);
  process.exit(1);
});
