-- =========================================================
-- SUPABASE MIGRATION: Extended Trello Clone Schema
-- =========================================================
-- This migration adds support for:
-- 1. Members (team members and assignees)
-- 2. Labels (color-coded tags for cards)
-- 3. Checklists (task lists within cards)
-- 4. Comments & Activity Log
-- 5. Card archiving

-- =========================================================
-- 0. BASE TABLES (required before extension tables)
-- =========================================================
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON boards(created_at DESC);

CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, title)
);

CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_sort_order ON columns(board_id, sort_order);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  due_date DATE,
  priority task_priority NOT NULL DEFAULT 'medium',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(column_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);


-- =========================================================
-- 1. MEMBERS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  color TEXT DEFAULT '#3b82f6', -- Default blue
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, email)
);

CREATE INDEX IF NOT EXISTS idx_members_board_id ON members(board_id);

-- =========================================================
-- 2. LABELS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, name)
);

CREATE INDEX IF NOT EXISTS idx_labels_board_id ON labels(board_id);

-- =========================================================
-- 3. CARD-LABEL JUNCTION TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS card_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, label_id)
);

CREATE INDEX IF NOT EXISTS idx_card_labels_task_id ON card_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON card_labels(label_id);

-- =========================================================
-- 4. CHECKLIST ITEMS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);

-- =========================================================
-- 5. COMMENTS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- =========================================================
-- 6. ACTIVITY LOG TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  action TEXT NOT NULL, -- 'created', 'updated', 'moved', 'labeled', 'assigned', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_board_id ON activity_logs(board_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- =========================================================
-- 6.1 ATTACHMENTS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at DESC);

-- =========================================================
-- 7. EXTEND TASKS TABLE
-- =========================================================
-- Add new columns to tasks table if they don't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_member_id UUID REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Drop the old assignee text column - but only if the new FK column exists
-- (Manual step: Run separately if needed)
-- ALTER TABLE tasks DROP COLUMN IF EXISTS assignee;

-- =========================================================
-- 8. SAMPLE DATA
-- =========================================================
-- Insert sample members (you'll need to update board_id to match your actual board)
-- Uncomment and modify as needed:
/*
INSERT INTO members (board_id, name, email, color)
VALUES 
  ('YOUR_BOARD_ID', 'John Doe', 'john@example.com', '#ef4444'),
  ('YOUR_BOARD_ID', 'Jane Smith', 'jane@example.com', '#f97316'),
  ('YOUR_BOARD_ID', 'Bob Johnson', 'bob@example.com', '#eab308');

INSERT INTO labels (board_id, name, color)
VALUES 
  ('YOUR_BOARD_ID', 'Bug', '#ef4444'),
  ('YOUR_BOARD_ID', 'Feature', '#3b82f6'),
  ('YOUR_BOARD_ID', 'Documentation', '#8b5cf6'),
  ('YOUR_BOARD_ID', 'Question', '#ec4899');
*/

-- =========================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
-- Uses Clerk-style subject from JWT claims.
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;

-- Add storage metadata columns for attachment file cleanup.
ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS bucket_name TEXT DEFAULT 'attachments',
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Core tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Boards
DROP POLICY IF EXISTS "boards_select" ON boards;
DROP POLICY IF EXISTS "boards_insert" ON boards;
DROP POLICY IF EXISTS "boards_update" ON boards;
DROP POLICY IF EXISTS "boards_delete" ON boards;
CREATE POLICY "boards_select" ON boards
FOR SELECT USING (user_id = requesting_user_id());
CREATE POLICY "boards_insert" ON boards
FOR INSERT WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "boards_update" ON boards
FOR UPDATE USING (user_id = requesting_user_id())
WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "boards_delete" ON boards
FOR DELETE USING (user_id = requesting_user_id());

-- Columns
DROP POLICY IF EXISTS "columns_select" ON columns;
DROP POLICY IF EXISTS "columns_insert" ON columns;
DROP POLICY IF EXISTS "columns_update" ON columns;
DROP POLICY IF EXISTS "columns_delete" ON columns;
CREATE POLICY "columns_select" ON columns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "columns_insert" ON columns
FOR INSERT WITH CHECK (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "columns_update" ON columns
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "columns_delete" ON columns
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = columns.board_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Tasks
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_select" ON tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM columns
    JOIN boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "tasks_insert" ON tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM columns
    JOIN boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "tasks_update" ON tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM columns
    JOIN boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM columns
    JOIN boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "tasks_delete" ON tasks
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM columns
    JOIN boards ON boards.id = columns.board_id
    WHERE columns.id = tasks.column_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Members
DROP POLICY IF EXISTS "members_select" ON members;
DROP POLICY IF EXISTS "members_insert" ON members;
DROP POLICY IF EXISTS "members_update" ON members;
DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_select" ON members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = members.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "members_insert" ON members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = members.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "members_update" ON members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = members.board_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = members.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "members_delete" ON members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = members.board_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Labels
DROP POLICY IF EXISTS "labels_select" ON labels;
DROP POLICY IF EXISTS "labels_insert" ON labels;
DROP POLICY IF EXISTS "labels_update" ON labels;
DROP POLICY IF EXISTS "labels_delete" ON labels;
CREATE POLICY "labels_select" ON labels
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = labels.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "labels_insert" ON labels
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = labels.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "labels_update" ON labels
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = labels.board_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = labels.board_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "labels_delete" ON labels
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = labels.board_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Card Labels
DROP POLICY IF EXISTS "card_labels_select" ON card_labels;
DROP POLICY IF EXISTS "card_labels_insert" ON card_labels;
DROP POLICY IF EXISTS "card_labels_update" ON card_labels;
DROP POLICY IF EXISTS "card_labels_delete" ON card_labels;
CREATE POLICY "card_labels_select" ON card_labels
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = card_labels.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "card_labels_insert" ON card_labels
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = card_labels.task_id
      AND boards.user_id = requesting_user_id()
  )
  AND EXISTS (
    SELECT 1
    FROM labels
    JOIN boards ON boards.id = labels.board_id
    WHERE labels.id = card_labels.label_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "card_labels_update" ON card_labels
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = card_labels.task_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = card_labels.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "card_labels_delete" ON card_labels
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = card_labels.task_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Checklist Items
DROP POLICY IF EXISTS "checklist_items_select" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_insert" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_update" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_delete" ON checklist_items;
CREATE POLICY "checklist_items_select" ON checklist_items
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = checklist_items.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "checklist_items_insert" ON checklist_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = checklist_items.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "checklist_items_update" ON checklist_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = checklist_items.task_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = checklist_items.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "checklist_items_delete" ON checklist_items
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = checklist_items.task_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Comments
DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_update" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_select" ON comments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = comments.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "comments_insert" ON comments
FOR INSERT WITH CHECK (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = comments.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "comments_update" ON comments
FOR UPDATE USING (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = comments.task_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (
  user_id = requesting_user_id()
);
CREATE POLICY "comments_delete" ON comments
FOR DELETE USING (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = comments.task_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Activity Logs
DROP POLICY IF EXISTS "activity_logs_select" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_update" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_delete" ON activity_logs;
CREATE POLICY "activity_logs_select" ON activity_logs
FOR SELECT USING (
  (
    board_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = activity_logs.board_id
        AND boards.user_id = requesting_user_id()
    )
  )
  OR
  (
    task_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM tasks
      JOIN columns ON columns.id = tasks.column_id
      JOIN boards ON boards.id = columns.board_id
      WHERE tasks.id = activity_logs.task_id
        AND boards.user_id = requesting_user_id()
    )
  )
);
CREATE POLICY "activity_logs_insert" ON activity_logs
FOR INSERT WITH CHECK (
  user_id = requesting_user_id()
  AND (
    (
      board_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = activity_logs.board_id
          AND boards.user_id = requesting_user_id()
      )
    )
    OR
    (
      task_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM tasks
        JOIN columns ON columns.id = tasks.column_id
        JOIN boards ON boards.id = columns.board_id
        WHERE tasks.id = activity_logs.task_id
          AND boards.user_id = requesting_user_id()
      )
    )
  )
);
CREATE POLICY "activity_logs_update" ON activity_logs
FOR UPDATE USING (user_id = requesting_user_id())
WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "activity_logs_delete" ON activity_logs
FOR DELETE USING (user_id = requesting_user_id());

-- Attachments
DROP POLICY IF EXISTS "attachments_select" ON attachments;
DROP POLICY IF EXISTS "attachments_insert" ON attachments;
DROP POLICY IF EXISTS "attachments_update" ON attachments;
DROP POLICY IF EXISTS "attachments_delete" ON attachments;
CREATE POLICY "attachments_select" ON attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = attachments.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "attachments_insert" ON attachments
FOR INSERT WITH CHECK (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = attachments.task_id
      AND boards.user_id = requesting_user_id()
  )
);
CREATE POLICY "attachments_update" ON attachments
FOR UPDATE USING (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = attachments.task_id
      AND boards.user_id = requesting_user_id()
  )
)
WITH CHECK (user_id = requesting_user_id());
CREATE POLICY "attachments_delete" ON attachments
FOR DELETE USING (
  user_id = requesting_user_id()
  AND EXISTS (
    SELECT 1
    FROM tasks
    JOIN columns ON columns.id = tasks.column_id
    JOIN boards ON boards.id = columns.board_id
    WHERE tasks.id = attachments.task_id
      AND boards.user_id = requesting_user_id()
  )
);

-- Supabase Storage bucket + object policies for attachments.
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "attachments_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "attachments_storage_delete" ON storage.objects;

CREATE POLICY "attachments_storage_select" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "attachments_storage_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments'
  AND name LIKE requesting_user_id() || '/%'
);

CREATE POLICY "attachments_storage_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments'
  AND name LIKE requesting_user_id() || '/%'
)
WITH CHECK (
  bucket_id = 'attachments'
  AND name LIKE requesting_user_id() || '/%'
);

CREATE POLICY "attachments_storage_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments'
  AND name LIKE requesting_user_id() || '/%'
);
