-- The Rex interview behind each resume, so the chat can be resumed after building:
-- { "messages": [{ "role", "content" }], "form_data": {...}, "done": bool }
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS interview JSONB;
