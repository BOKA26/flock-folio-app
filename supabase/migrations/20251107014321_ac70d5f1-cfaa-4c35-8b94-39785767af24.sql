-- Drop the existing check constraint
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_type_check;

-- Add new check constraint that includes 'evenement'
ALTER TABLE announcements ADD CONSTRAINT announcements_type_check 
CHECK (type IN ('annonce', 'culte', 'evenement'));