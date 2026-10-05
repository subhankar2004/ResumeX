-- 001 seeded three templates pointing at .tex files that never existed
-- (modern-pro, academic-fresher, tech-lead). Re-point every row at the real files in
-- backend/templates/, updating in place so resumes keep their template_id.

UPDATE templates SET
    name = 'Minimal Tech',
    description = 'Clean single-column resume perfect for software engineers and technical roles',
    tex_path = 'templates/minimal-tech.tex',
    tags = ARRAY['tech', 'minimal', 'single-column'],
    is_pro_only = FALSE
WHERE tex_path IN ('/templates/minimal-tech.tex', 'templates/minimal-tech.tex');

UPDATE templates SET
    name = 'Experienced Professional',
    description = 'Compact layout optimized for senior professionals with extensive experience',
    tex_path = 'templates/experienced-pro.tex',
    tags = ARRAY['experienced', 'professional'],
    is_pro_only = FALSE
WHERE tex_path IN ('/templates/modern-pro.tex', 'templates/experienced-pro.tex');

UPDATE templates SET
    name = 'Fresh Graduate',
    description = 'Education-first layout ideal for students and new graduates',
    tex_path = 'templates/fresher.tex',
    tags = ARRAY['student', 'fresher', 'graduate'],
    is_pro_only = FALSE
WHERE tex_path IN ('/templates/academic-fresher.tex', 'templates/fresher.tex');

UPDATE templates SET
    name = 'Creative Professional',
    description = 'Elegant design with refined typography for creative roles',
    tex_path = 'templates/creative.tex',
    tags = ARRAY['creative', 'design', 'elegant'],
    is_pro_only = TRUE
WHERE tex_path IN ('/templates/creative.tex', 'templates/creative.tex');

UPDATE templates SET
    name = 'Career Changer',
    description = 'Skills-focused layout emphasizing transferable competencies and career transition',
    tex_path = 'templates/career-changer.tex',
    tags = ARRAY['career-change', 'transferable-skills'],
    is_pro_only = FALSE
WHERE tex_path IN ('/templates/tech-lead.tex', 'templates/career-changer.tex');
