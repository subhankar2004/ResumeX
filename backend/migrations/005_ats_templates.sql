-- Estimated ATS-friendliness per template (0-100), shown in the gallery and used for sorting.
-- Scores are our assessment of layout factors (single column, standard headings, machine-readable
-- text via glyphtounicode, no graphics carrying meaning), not output from a specific ATS vendor.
ALTER TABLE templates ADD COLUMN IF NOT EXISTS ats_score INTEGER NOT NULL DEFAULT 90;

UPDATE templates SET ats_score = 94 WHERE tex_path = 'templates/minimal-tech.tex';
UPDATE templates SET ats_score = 94 WHERE tex_path = 'templates/experienced-pro.tex';
UPDATE templates SET ats_score = 93 WHERE tex_path = 'templates/fresher.tex';
UPDATE templates SET ats_score = 93 WHERE tex_path = 'templates/career-changer.tex';
UPDATE templates SET ats_score = 85 WHERE tex_path = 'templates/creative.tex';

INSERT INTO templates (name, description, tex_path, tags, is_pro_only, ats_score)
SELECT * FROM (VALUES
    ('Software Engineer', 'Experience-first, single-column layout in the style big-tech recruiters expect',
     'templates/software-engineer.tex', ARRAY['tech', 'engineering', 'ats-optimized'], FALSE, 98),
    ('Data Scientist', 'Skills-forward Charter layout for data, ML and analytics roles',
     'templates/data-scientist.tex', ARRAY['tech', 'data', 'ats-optimized'], FALSE, 97),
    ('Business Professional', 'Classic Palatino layout for management, sales, marketing, finance and operations',
     'templates/business-professional.tex', ARRAY['business', 'non-tech', 'ats-optimized'], FALSE, 97),
    ('Graduate', 'One-page layout for students and new graduates, education and projects first',
     'templates/graduate.tex', ARRAY['fresher', 'student', 'ats-optimized'], FALSE, 97),
    ('Modern Sans', 'Clean Helvetica layout with a teal accent that suits any field',
     'templates/modern-sans.tex', ARRAY['modern', 'any-field'], TRUE, 95),
    ('Executive', 'Understated Times layout for senior leaders with long track records',
     'templates/executive.tex', ARRAY['leadership', 'experienced', 'non-tech'], TRUE, 96)
) AS new_templates (name, description, tex_path, tags, is_pro_only, ats_score)
WHERE NOT EXISTS (SELECT 1 FROM templates t WHERE t.tex_path = new_templates.tex_path);
