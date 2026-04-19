ALTER TABLE metier.reve
  ADD COLUMN IF NOT EXISTS video_status varchar NOT NULL DEFAULT 'pending';

UPDATE metier.reve r
SET video_status = 'waiting_validation'
WHERE video_status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM metier.analyse_ai_reve a
    WHERE a.reve_id = r.ref_reve
      AND NULLIF(a.resume_reve, '') IS NOT NULL
  );
