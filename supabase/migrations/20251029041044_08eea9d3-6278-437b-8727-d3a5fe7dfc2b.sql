-- Add type column to announcements table to distinguish between regular announcements and worship programs
ALTER TABLE public.announcements 
ADD COLUMN type text NOT NULL DEFAULT 'annonce' CHECK (type IN ('annonce', 'culte'));

-- Add comment to explain the column
COMMENT ON COLUMN public.announcements.type IS 'Type of announcement: annonce (regular announcement) or culte (worship program)';

-- Add index for better query performance
CREATE INDEX idx_announcements_type ON public.announcements(type);
CREATE INDEX idx_announcements_church_type ON public.announcements(church_id, type);