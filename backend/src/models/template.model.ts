import pool from '../config/database';
import { Template } from '../types';

export const TemplateModel = {
  // Get all templates (optionally filter by plan)
  async findAll(includePro: boolean = false): Promise<Template[]> {
    const query = includePro
      ? 'SELECT * FROM templates ORDER BY ats_score DESC, name'
      : 'SELECT * FROM templates WHERE is_pro_only = false ORDER BY ats_score DESC, name';
    
    const result = await pool.query(query);
    return result.rows;
  },

  // Get template by ID
  async findById(id: string): Promise<Template | null> {
    const result = await pool.query(
      'SELECT * FROM templates WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },
};
