import pool from '../config/database';
import { InterviewSession, Resume, ResumeFormData } from '../types';

export const ResumeModel = {
  // Get all resumes for a user
  async findByUserId(userId: string): Promise<Resume[]> {
    const result = await pool.query(
      `SELECT r.*, t.name as template_name
       FROM resumes r
       LEFT JOIN templates t ON r.template_id = t.id
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get single resume by ID (with user check)
  async findById(id: string, userId: string): Promise<Resume | null> {
    const result = await pool.query(
      `SELECT * FROM resumes 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  // Create new resume
  async create(
    userId: string,
    title: string,
    templateId: string,
    formData: ResumeFormData,
    latexSource: string,
    interview: InterviewSession | null = null
  ): Promise<Resume> {
    const result = await pool.query(
      `INSERT INTO resumes (user_id, title, template_id, form_data, latex_source, interview)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, templateId, formData, latexSource, interview]
    );
    return result.rows[0];
  },

  // Update resume
  async update(
    id: string,
    userId: string,
    updates: {
      title?: string;
      form_data?: ResumeFormData;
      latex_source?: string;
      interview?: InterviewSession;
    }
  ): Promise<Resume | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.form_data !== undefined) {
      fields.push(`form_data = $${paramCount++}`);
      values.push(updates.form_data);
    }
    if (updates.latex_source !== undefined) {
      fields.push(`latex_source = $${paramCount++}`);
      values.push(updates.latex_source);
    }
    if (updates.interview !== undefined) {
      fields.push(`interview = $${paramCount++}`);
      values.push(updates.interview);
    }

    if (fields.length === 0) {
      return this.findById(id, userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE resumes 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCount++} AND user_id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // Fork/duplicate a resume
  async fork(id: string, userId: string, newTitle: string): Promise<Resume | null> {
    const original = await this.findById(id, userId);
    if (!original) return null;

    const result = await pool.query(
      `INSERT INTO resumes (user_id, title, template_id, form_data, latex_source, interview, forked_from)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        newTitle,
        original.template_id,
        original.form_data,
        original.latex_source,
        original.interview ?? null,
        id,
      ]
    );
    return result.rows[0];
  },

  // Delete resume
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  },

  // Count resumes for a user (for plan limits)
  async countByUserId(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM resumes WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  },
};
