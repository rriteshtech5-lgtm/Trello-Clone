export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  user_id: string;
}

export type ColumnWithTasks = Column & {
  tasks: TaskWithRelations[];
};

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  sort_order: number;
  created_at: string;
  is_archived?: boolean;
  assigned_member_id?: string | null;
  cover_image_url?: string | null;
}

export interface TaskWithRelations extends Task {
  labels?: Label[];
  checklist_items?: ChecklistItem[];
  comments?: Comment[];
  attachments?: Attachment[];
  assigned_member?: Member | null;
}

export interface Member {
  id: string;
  board_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  color: string;
  created_at: string;
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CardLabel {
  id: string;
  task_id: string;
  label_id: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string | null;
  board_id: string | null;
  user_id: string;
  action: string;
  description: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  bucket_name?: string | null;
  storage_path?: string | null;
  created_at: string;
}
