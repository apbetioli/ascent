-- Add format column and remove is_reverse column from goals table

-- Add format column with default 'number'
alter table goals
  add column format text default 'number' check (format in ('number', 'currency'));

-- Update existing rows to have format based on is_reverse logic
-- (This is a best guess - we'll default to 'number' for all existing goals)
-- If you had reverse goals, you might want to set them to currency, but we'll default to number
update goals set format = 'number';

-- Remove is_reverse column
alter table goals drop column is_reverse;
